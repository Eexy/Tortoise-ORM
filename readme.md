# Tortoise

Tortoise is a small wrapper around firebase-admin for better typescript integration and manage collection easily.

## Why use Tortoise

Like said Tortoise is a wrapper around firebase-admin but with great functionalities

- Typescript is integrated, so you know what is the shape of a document
- Tortoise doesn't throw error when manipulating document but return the error. That plus typescript you are sur to
  never miss an error
- It can sanitize you data : Before creating or updating a document Tortoise will remove all undefined key, so you don't
  need to change firebase settings
- It is easy to build queries

## How to use Tortoise

### Register a new app

The first thing to do is to register a new tortoise app. To do that you juste have to create a new firebase app and then
to do :

```typescript
import { initializeTortoiseApp } from "tortoise-orm";

initializeTortoiseApp(app)
```

When you register app you can pass a name. By default, the app name is "admin" but if you want to change it you can do
like this :

```typescript
import { initializeTortoiseApp } from "tortoise-orm";

initializeTortoiseApp(app, "test")
```

Be careful this will throw an error if you pass an app with an already existing name

### Create a repository

Now that you have registered an app you can create a repository by passing it the collection's name and the interface to
describe documents

```typescript
import { FirestoreRepository } from "tortoise-orm";

interface User {
  email: string;
  firstName: string;
  lastName: string;
}

const repo = new FirestoreRepository<User>("users")
```

When you create a repository by default it will use the admin app, but you can change the behavior by passing the app's
name

```typescript
import { FirestoreRepository } from "tortoise-orm";

interface User {
  email: string;
  firstName: string;
  lastName: string;
}

const repo = new FirestoreRepository<User>("users", "test")
```

### Use the repository

It's time to use your new repository

#### Create a document

To create a document it's very simple you just have to do :

```typescript
import repository from "../myRepository"

const user = await repository.create({
  email: "john.doe@test.com",
  firstName: "John",
  lastName: "Doe"
})
```

If you want to create a document with a special uid you can pass your uid at the same time like that :

```typescript
import repository from "../myRepository"

const [user, err] = await repository.create({
  email: "john.doe@test.com",
  firstName: "John",
  lastName: "Doe"
}, "user_uid")
```

### Updating a document

To update a document you just have to pass the document uid and the updates you want to apply

```typescript
import repository from "../myRepository"

const user = await repository.update({
  email: "john.doe@test.com",
  firstName: "John",
  lastName: "Doe"
}, "user_uid")
```

### Finding documents

#### Find multiple docs

Now that you have create multiple document maybe you want to find them. Finding document with Tortoise is very easily
because it integrated an easy way to build queries.

```typescript
import repository from "../myRepository"
import { isDifferent } from "tortoise-orm";

const users = await repository.find({
  email: "john.doe@test.com",
  firstName: isDifferent("Jhon"),
})
```

Here is the list of all integrated queries :

- isDifferent
- isGreaterThan
- isGreaterThanOrEqual
- isLessThan
- isLessThanOrEqual
- isIn
- isNotIn
- isArrayContainsAny

When you search for document you can also pass a limit and an order direction like that :

```typescript
import repository from "../myRepository"
import { isDifferent } from "tortoise-orm";

const users = await repository.find({
  email: "john.doe@test.com",
  firstName: isDifferent("Jhon"),
}, 3, ["email", "desc"])
```

#### Find one doc

To juste find one doc you need to use the function findOne :

```typescript
import repository from "../myRepository"
import { isDifferent } from "tortoise-orm";

const user = await repository.findOne({
  email: "john.doe@test.com",
  firstName: isDifferent("Jhon"),
})
```

#### Find a doc by its uid

If you need to get a document by its uid you can do it by using the function findByUid

```typescript
import repository from "../myRepository"
import { isDifferent } from "tortoise-orm";

const user = await repository.findByUid("user_uid")
```

### Delete a document

To delete a document juste use the delete function by passing the document's uid :

```typescript
import repository from "../myRepository"
import { isDifferent } from "tortoise-orm";

const res = await repository.delete("user_uid")
```