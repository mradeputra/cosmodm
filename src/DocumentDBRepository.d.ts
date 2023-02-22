import { CosmosClient, Container, FeedOptions } from "@azure/cosmos";
import { ModelBase } from "./ModelBase";
import { IDocumentDBRepository } from "./IDocumentDBRepository.base";
import { v4 as uuidv4 } from "uuid";
import { OrderBy, toSql } from "./query";

type PartitionKey = Record<string, string>;

export default class DocumentDBRepository<T extends ModelBase>
  implements IDocumentDBRepository<T>
{
  private readonly _databaseId: string;
  private readonly _defaultPageSize = -1;
  private readonly _collectionId: string;
  private readonly _client: CosmosClient;
  private readonly _partitionPropertyDefined: boolean = false;
  private readonly _partitionPropertyNames: string[] | null = null;
  private readonly _partitionProperties: PropertyDescriptor[] = [];
  private readonly _disposed = false;
  private readonly _namespace: string;
  private readonly _model: T;

  constructor(
    databaseId: string,
    client: CosmosClient,
    model: T,
    partitionProperties?: string
  ) {
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

  private _generatePartitionKey(item: T): string {
    let text = this._collectionId;
    if (this._partitionPropertyNames && this._partitionPropertyDefined) {
      for (let i = 0; i < this._partitionPropertyNames.length; i++) {
        const partitionPropertyName = this._partitionPropertyNames[i];
        const propertyDesc = Object.getOwnPropertyDescriptor(
          item,
          partitionPropertyName
        );
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this._partitionProperties.push(propertyDesc!);
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

  private _composePartitionKey(item: PartitionKey): string {
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

  async CreateAsync(
    item: T,
    createdBy?: string,
    activeFlag?: string
  ): Promise<T> {
    const container: Container = this._client
      .database(this._databaseId)
      .container(this._collectionId);
    if (!item._id) {
      item._id = uuidv4();
    }
    item.createdBy = createdBy ?? "";
    item.activeFlag = activeFlag ?? "Y";
    item.createdDate = new Date().toISOString();
    item.lastUpdatedBy = "";
    item.lastUpdatedDate = item._createdDate;
    item.partitionKey = this._generatePartitionKey(item);
    const { resource } = await container.items.create(item);
    return resource as T;
  }

  async GetByIdAsync(
    id: string,
    partitionKey?: PartitionKey
  ): Promise<T | null> {
    const container: Container = this._client
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
      const { resource } = await container.item(id, pk).read<T>();
      return resource as T;
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
  }

  async DeleteAsync(id: string, partitionKey?: PartitionKey): Promise<boolean> {
    const container: Container = this._client
      .database(this._databaseId)
      .container(this._collectionId);
    const pk = partitionKey
      ? this._composePartitionKey(partitionKey)
      : this._collectionId;
    const { statusCode } = await container.item(id, pk).delete();
    return statusCode === 204;
  }

  async UpdateAsync(id: string, item: T, lastUpdatedBy?: string): Promise<T> {
    const container: Container = this._client
      .database(this._databaseId)
      .container(this._collectionId);
    const pk = this._generatePartitionKey(item);
    const oldItem = await container.item(id, pk).read<T>();
    if (!oldItem.resource) {
      throw new Error("Error when update data, old data not found");
    }
    item.lastUpdatedBy = lastUpdatedBy ?? "";
    item.lastUpdatedDate = new Date().toISOString();
    const updatedRecord = { ...oldItem.resource, ...item };

    const updatedItem = await container.item(id, pk).replace(updatedRecord);

    return updatedItem.resource as T;
  }

  async GetAsync(options?: {
    predicate?: any;
    orderBy?: OrderBy<T>;
    selector?: any;
    usePaging?: boolean;
    pageSize?: number;
    partitionKey?: PartitionKey;
    enableCrossPartition?: boolean;
  }): Promise<T[]> {
    const container: Container = this._client
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
      options?.predicate && options ? options.predicate : (p: T) => true;
    const feedOpts: FeedOptions = {
      maxItemCount: maxCount,
      partitionKey: pk,
    };

    if (options?.usePaging && options.orderBy == null) {
      options.orderBy = { property: "id", descending: false };
    }

    const [outputQuery, params] = toSql<T>(
      pred,
      options?.selector,
      options?.orderBy
    );

    const querySpec = { query: outputQuery, parameters: params };
    const { resources } = await container.items
      .query(querySpec, feedOpts)
      .fetchAll();
    return resources as T[];
  }
}
