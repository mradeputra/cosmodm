import { OrderBy } from "./query";
import { ModelBase } from "./modelBase";
type PartitionKey = Record<string, string>
export interface IDocumentDBRepository<T extends ModelBase> {
  CreateAsync(item: T, createdBy?: string, activeFlag?: string): Promise<T>
  GetByIdAsync(id: string, partitionKey?: PartitionKey): Promise<T | null>
  DeleteAsync(id: string, partitionKey?: PartitionKey): Promise<boolean>
  UpdateAsync(id: string, item: T, lastUpdatedBy?: string): Promise<T>
  CountAsync(options?: {
    predicate?: any
    partitionKey?: PartitionKey
    enableCrossPartition?: boolean
  }): Promise<number>
  GetAsync(options?: {
    predicate?: any
    orderBy?: OrderBy<T>
    selector?: any
    usePaging?: boolean
    pageSize?: number
    partitionKey?: PartitionKey
    enableCrossPartition?: boolean
  }): Promise<T[]>
}
