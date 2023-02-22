# Cosmodm

Cosmodm is a module that provides a high-level abstraction layer for interacting with Azure Cosmos DB. The module includes a set of files that allow developers to easily create, read, update, and delete documents in their Cosmos DB collections.

**modelBase.js** serves as a base class that other models can inherit from, providing a set of common methods and properties such as the ability to define custom validation rules for model data, and support for defining virtual properties. This base class helps in reducing code duplication and promotes code reuse across different models.

**DocumentDBRepository.js**, on the other hand, is a utility module that provides a set of methods for performing common CRUD (Create, Read, Update, Delete) operations on DocumentDB, as well as support for pagination, querying, and transactional consistency. This module helps to abstract away the complexity of working directly with DocumentDB's API, providing a simplified and consistent interface for accessing and manipulating data stored in the database.

Together, these files provide a powerful set of tools for working with Cosmos DB, making it easier for developers to build scalable, performant, and reliable applications on the Azure platform.

---

## How to use ModelBase class

The **ModelBase** class is a base class that can be extended to create models in a project. It provides basic properties and methods that can be used to manage data in a database.

### Usage

To create a new model, extend the **ModelBase** class and add any additional properties and methods as needed. For example:

```js
import { ModelBase } from "cosmodm";

class Person extends ModelBase {
  userName: string;

  email: string;

  password: string;

  gender: string;
}
```

The ModelBase class provides the following properties that can be accessed or set by the derived class:

- **id**: The unique identifier for the model.
- **documentType**: The type of the document, which is automatically generated based on the name of the derived class.
- **documentNamespace**: The namespace of the document, which is automatically generated based on the name of the derived class.
- **partitionKey**: The partition key for the document.
- **createdDate**: The date the document was created.
- **createdBy**: The user who created the document.
- **lastUpdatedDate**: The date the document was last updated.
- **lastUpdatedBy**: The user who last updated the document.
- **activeFlag**: A flag indicating whether the document is active or not.
- **etag**: The entity tag for the document.

For example, to get the **id** property of a MyModel object, you can use the **id** getter method:

```js
const myModel = new MyModel();
const id = myModel.id;
```

---

## How to use DocumentDBRepository

This is a Node.js module that provides an interface for interacting with a Microsoft Azure Cosmos DB database using the SQL API.

### Usage

To use this module, first create **unitOfWork.js** file and import the module into your code like this:

```js
import { DocumentDBRepository } from "cosmodm";
const DB = "MyDB";
const client = new CosmosClient("your cosmosDB connection string");

export default class UnitOfWork {
  ModelRepository;

  constructor() {
    this.ModelRepository = new DocumentDBRepository(
      DB,
      client,
      new MyModel(),
      partitionKeyProperties
    );
  }
}
```

#### **Create a new document**

To create a new document, call the **CreateAsync** method:

```js
import UnitOfWork from "repositories";

const unitOfWork = new UnitOfWork();
const item = {
  /* document data */
};
const createdBy = "user@example.com";
const activeFlag = "Y";
const document = await unitOfWork.ModelRepository.CreateAsync(
  item,
  createdBy,
  activeFlag
);
```

#### **Retrieve a document by ID**

To retrieve a document by ID, call the **GetByIdAsync** method:

```js
import UnitOfWork from "repositories";

const unitOfWork = new UnitOfWork();
const id = "12345";
const partitionKey = "examplePartitionKey";
const document = await unitOfWork.ModelRepository.GetByIdAsync(
  id,
  partitionKey
);
```

#### **Update a document**

To update a document, call the **UpdateAsync** method:

```js
import UnitOfWork from "repositories";

const unitOfWork = new UnitOfWork();
const id = "12345";
const lastUpdatedBy = "user@example.com";
const updated = await unitOfWork.ModelRepository.UpdateAsync(
  id,
  item,
  lastUpdatedBy
);
```

#### **Delete a document**

To delete a document, call the **DeleteAsync** method:

```js
import UnitOfWork from "repositories";

const unitOfWork = new UnitOfWork();
const id = "12345";
const partitionKey = "examplePartitionKey";
const deleted = await unitOfWork.ModelRepository.DeleteAsync(id, partitionKey);
```

#### **Query documents**

To query documents, call the **GetAsync** method:

```js
import UnitOfWork from "repositories";

const unitOfWork = new UnitOfWork();
const options = {
  partitionKey: "examplePartitionKey",
  usePaging: true,
  predicate: (item) => item.userName === "example",
  selector: ["userName"],
  orderBy: { property: "userName", descending: true },
  pageSize: 10,
};
const documents = await unitOfWork.Modelrepository.GetAsync(options);
```

Where options is an object that contains the following properties:

- partitionKey (optional) - The partition key to use for the query.
- usePaging (optional) - Whether or not to use paging.
- predicate (optional) - A function that returns a boolean indicating whether or not an item should be included in the query results.
- selector (optional) - A string or array of an object properties to desired. (**keyof Model** or **Array[keyof Model]**)
- orderBy (optional) - An object that specifies the property to sort by and whether to sort in ascending or descending order.
- pageSize (optional) - The maximum number of items to return per page.
