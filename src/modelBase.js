"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelBase = void 0;
class ModelBase {
  constructor() {
    this.documentType = this.generateDocumentType(this.constructor);
    this.documentNamespace = this.generateDocumentNamespace(this.constructor);
  }
  get _id() {
    return this.id;
  }
  set _id(value) {
    this.id = value;
  }
  get _documentType() {
    return this.documentType;
  }
  get _documentNamespace() {
    return this.documentNamespace;
  }
  get _partitionKey() {
    return this.partitionKey;
  }
  set _partitionKey(value) {
    this.partitionKey = value;
  }
  get _createdDate() {
    return this.createdDate;
  }
  set _createdDate(value) {
    this.createdDate = value;
  }
  get _createdBy() {
    return this.createdBy;
  }
  set _createdBy(value) {
    this.createdBy = value;
  }
  get _lastUpdatedDate() {
    return this.lastUpdatedDate;
  }
  set _lastUpdatedDate(value) {
    this.lastUpdatedDate = value;
  }
  get _lastUpdatedBy() {
    return this.lastUpdatedBy;
  }
  set _lastUpdatedBy(value) {
    this.lastUpdatedBy = value;
  }
  get _activeFlag() {
    return this.activeFlag;
  }
  set _activeFlag(value) {
    this.activeFlag = value;
  }
  get _etag() {
    return this.etag;
  }
  set _etag(value) {
    this.etag = value;
  }
  generateDocumentNamespace(t) {
    let text = "";
    let type = t;
    while (type.name !== "ModelBase") {
      text = `${type.name}.${text}`;
      if (type.__proto__ !== null) {
        type = type.__proto__;
      }
    }
    return `.${text}`;
  }
  generateDocumentType(t) {
    return t.name;
  }
}
exports.ModelBase = ModelBase;
//# sourceMappingURL=ModelBase.js.map
