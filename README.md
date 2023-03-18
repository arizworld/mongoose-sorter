# Mongoose Sorter

## Description 
A library for dynamically generating sort pipelines for Mongoose aggregations based on a provided configuration.

## Installation

To install, use npm:

```bash
    npm install mongoose-sorter
```

## Usage

Before starting lets understand the sort config: 

```typescript

    /** We can sort based on five primary data types string | number | array | date | boolean*/
    type SortTypes = 'string' | 'number' | 'array' | 'date' | 'boolean'
    /** This is the config object to specify for which field you want to able the sorting.
     * @param key is the name of the field you want to able sorting for, this key should be in the sortQuery variable to sort for this key.
     * @param type is the type of field of the key you have specified.
     * @param databaseKey is an optional field.It is required when you want to sort for a field, but in database the key might be of another name.
     * @param nullReplacementKey is an optional field.It is required when you want to replace value of a field with another field if that field is missing or null.
     * @param nullReplacementValue if you specify this will replace null or missing values.
     * */
    export interface SortObject {
        [key: string]: {
            type: SortTypes,
            databaseKey?: string,
            nullReplacementKey?: string,
            nullReplacementValue?: unknown
        }
    }

```

Now lets create a sort config: 

## Example : sort by different database key
Config for a model where you want to sort name as string, score as number, section as an array by its length
and by date which will try to sort by updated_at, if updated_at is null(or undefined or the key doesn't exist) then by created_at, if that is also null(or undefined or the key doesn't exist) then by considering that field value to be current date.
if any other than the mentioned keys is sent in the `sortQuery` that will be ignored.
```typescript

    import { SortObject } from "mongoose-sorter";

    const sortObject: SortObject = {
    name: { type: string },
    score: { type: number },
    sectionLength: { type: array, databaseKey: 'section' },
    date: { type: Date, databaseKey: 'updated_at', nullReplacementValue: 'created_at',nullReplacementValue: new Date()  }
    }

```


## Example: sort nested fields

Lets assume the documents are like  : collection = [{ score: { grade : A+, marks: 80 }}....]
Now if you want to sort by marks field you can specify: 
```typescript

    const sortObj: SortObj = { marks: { type: number, databaseKey = 'score.marks' }}

```

Next, apply the configuration to the `Sorter` instance:

```typescript

    import sorter from "mongoose-sorter";

    sorter.apply(sortObject);

```

Or if you want to use the same configuration in different files apply the config into the instance:

```typescript
    //a.js
    import { Sorter } from "mongoose-sorter";

    Sorter.instance.apply(sortObject);

    //b.js
    import { Sorter } from "mongoose-sorter";
    const sorter = Sorter.instance; //will return the same config applied instance from file a.js
```

You can then use the `generateSortPipeline` method to generate a sort pipeline for a given sort query:

## `sorter.generateSortPipeline(sortQuery: string, willYouProject?: boolean, defaultSort?: Object, log?: boolean)`

This method generates the whole sort pipeline for the mongoose aggregation dynamically for different values of `sortQuery`.

### Parameters
- `sortQuery`: A string with the comma separated keys from the config and for the descending order prepending the key with '-' sign. Like if you want to sort by name ascending and score descending then `sortQuery`='name,-score'.
- `willYouProject`: You can set it to be `true` if you use `$project` in later stages of your pipeline. Thus it will be more efficient.
- `defaultSort`: You can set it if you want the fallback sort nature to be something else than `{ _id: 1 }`.
- `log`: You can set it to `true` if you want to log the returned pipeline.

### Example
```typescript

    //request url = {{absoluteUrl}}/?sort=name,-score
    // for this example considering the req.query.sort as the dynamic sortQuery
    // Use `sorter.generateSortPipeline()` in your Mongoose aggregation pipeline

    await model.aggregate([
    { pipelineStages },
    ...sorter.generateSortPipeline(req.query.sort as string, false, { name: 1 })
    ]);

```