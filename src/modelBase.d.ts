export class ModelBase {
  public readonly documentType: string;
  public readonly documentNamespace: string;
  public partitionKey: string;
  public createdDate: string;
  public createdBy: string;
  public lastUpdatedDate: string;
  public lastUpdatedBy: string;
  public activeFlag: string;
  public etag: string;
  public id: string;

  constructor() {
    this.documentType = this.generateDocumentType(this.constructor);
    this.documentNamespace = this.generateDocumentNamespace(this.constructor);
  }

  get _id(): string {
    return this.id;
  }

  set _id(value: string) {
    this.id = value;
  }

  get _documentType(): string {
    return this.documentType;
  }

  get _documentNamespace(): string {
    return this.documentNamespace;
  }

  get _partitionKey(): string {
    return this.partitionKey;
  }

  set _partitionKey(value: string) {
    this.partitionKey = value;
  }

  get _createdDate(): string {
    return this.createdDate;
  }

  set _createdDate(value: string) {
    this.createdDate = value;
  }

  get _createdBy(): string {
    return this.createdBy;
  }

  set _createdBy(value: string) {
    this.createdBy = value;
  }

  get _lastUpdatedDate(): string {
    return this.lastUpdatedDate;
  }

  set _lastUpdatedDate(value: string) {
    this.lastUpdatedDate = value;
  }

  get _lastUpdatedBy(): string {
    return this.lastUpdatedBy;
  }

  set _lastUpdatedBy(value: string) {
    this.lastUpdatedBy = value;
  }

  get _activeFlag(): string {
    return this.activeFlag;
  }

  set _activeFlag(value: string) {
    this.activeFlag = value;
  }

  get _etag(): string {
    return this.etag;
  }

  set _etag(value: string) {
    this.etag = value;
  }

  generateDocumentNamespace(t: any) {
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

  generateDocumentType(t: any) {
    return t.name;
  }
}
