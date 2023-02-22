"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const query_1 = require("./query");
class DocumentDBRepository {
  constructor(databaseId, client, model, partitionProperties) {
    this._defaultPageSize = -1;
    this._partitionPropertyDefined = false;
    this._partitionPropertyNames = null;
    this._partitionProperties = [];
    this._disposed = false;
    this._databaseId = databaseId;
    this._client = client;
    this._collectionId = model.documentType;
    this._namespace = model.documentNamespace;
    this._model = model;
    if (partitionProperties) {
      this._partitionPropertyDefined = true;
      this._partitionPropertyNames = partitionProperties.split(",");
    }
  }
  _generatePartitionKey(item) {
    let text = this._collectionId;
    if (this._partitionPropertyNames && this._partitionPropertyDefined) {
      for (let i = 0; i < this._partitionPropertyNames.length; i++) {
        const partitionPropertyName = this._partitionPropertyNames[i];
        const propertyDesc = Object.getOwnPropertyDescriptor(
          item,
          partitionPropertyName
        );
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this._partitionProperties.push(propertyDesc);
      }
    }
    if (this._partitionPropertyNames) {
      for (let i = 0; i < this._partitionProperties.length; i++) {
        const partitionProperty = this._partitionProperties[i];
        text += `/${partitionProperty.value}`;
      }
    }
    this._partitionProperties.pop();
    return text;
  }
  _composePartitionKey(item) {
    let text = this._collectionId;
    if (item) {
      if (!this._partitionPropertyDefined) return text;
      const values = Object.values(item);
      for (let i = 0; i < values.length; i++) {
        text += `/${values[i]}`;
      }
    }
    return text;
  }
  async CreateAsync(item, createdBy, activeFlag) {
    const container = this._client
      .database(this._databaseId)
      .container(this._collectionId);
    if (!item._id) {
      item._id = (0, uuid_1.v4)();
    }
    item.createdBy = createdBy ?? "";
    item.activeFlag = activeFlag ?? "Y";
    item.createdDate = new Date().toISOString();
    item.lastUpdatedBy = "";
    item.lastUpdatedDate = item._createdDate;
    item.partitionKey = this._generatePartitionKey(item);
    const { resource } = await container.items.create(item);
    return resource;
  }
  async GetByIdAsync(id, partitionKey) {
    const container = this._client
      .database(this._databaseId)
      .container(this._collectionId);
    const pk = partitionKey
      ? this._composePartitionKey(partitionKey)
      : this._collectionId;
    try {
      if (id == null || id === "") {
        throw new Error(
          "ID must be a string and cannot be undefined, null or empty"
        );
      }
      const { resource } = await container.item(id, pk).read();
      return resource;
    } catch (error) {
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
  }
  async DeleteAsync(id, partitionKey) {
    const container = this._client
      .database(this._databaseId)
      .container(this._collectionId);
    const pk = partitionKey
      ? this._composePartitionKey(partitionKey)
      : this._collectionId;
    const { statusCode } = await container.item(id, pk).delete();
    return statusCode === 204;
  }
  async UpdateAsync(id, item, lastUpdatedBy) {
    const container = this._client
      .database(this._databaseId)
      .container(this._collectionId);
    const pk = this._generatePartitionKey(item);
    const oldItem = await container.item(id, pk).read();
    if (!oldItem.resource) {
      throw new Error("Error when update data, old data not found");
    }
    item.lastUpdatedBy = lastUpdatedBy ?? "";
    item.lastUpdatedDate = new Date().toISOString();
    const updatedRecord = { ...oldItem.resource, ...item };
    const updatedItem = await container.item(id, pk).replace(updatedRecord);
    return updatedItem.resource;
  }
  async GetAsync(options) {
    const container = this._client
      .database(this._databaseId)
      .container(this._collectionId);
    if (!options?.partitionKey && options) {
      options.enableCrossPartition = true;
      options.pageSize = 10;
    }
    const pk = options?.partitionKey
      ? this._composePartitionKey(options.partitionKey)
      : this._collectionId;
    const maxItem = options?.partitionKey ? this._defaultPageSize : -1;
    const maxCount = options?.usePaging ? options.pageSize : maxItem;
    const pred =
      options?.predicate && options ? options.predicate : (p) => true;
    const feedOpts = {
      maxItemCount: maxCount,
      partitionKey: pk,
    };
    if (options?.usePaging && options.orderBy == null) {
      options.orderBy = { property: "id", descending: false };
    }
    const [outputQuery, params] = (0, query_1.toSql)(
      pred,
      options?.selector,
      options?.orderBy
    );
    const querySpec = { query: outputQuery, parameters: params };
    const { resources } = await container.items
      .query(querySpec, feedOpts)
      .fetchAll();
    return resources;
  }
}
exports.default = DocumentDBRepository;
//# sourceMappingURL=DocumentDBRepository.base.js.map
