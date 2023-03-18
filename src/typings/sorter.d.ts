/** We can sort based on five primary data types string | number | array | date | boolean*/
type SortTypes = 'string' | 'number' | 'array' | 'date' | 'boolean'
/** This is the config object to specify for which field you want to able the sorting.
 * @param key is the name of the field you want to able sorting for, this key should be in the sortQuery variable to sort for this key.
 * @param type is the type of field of the key you have specified.
 * @param databaseKey is an optional field.It is required when you want to sort for a field, but in database the key might be of another name.
 * @param nullReplacementKey is an optional field.It is required when you want to replace value of a field with another field if that field is missing or null.
 * @param nullReplacementValue if you specify this will replace null or missing values.
 * @example say you want to sort by date so your
 * const sortQuery = 'date', but in your database it is the field 'created_by' that you want to sort with then you can specify const databaseKey = 'created_by'
 * * sorting for nested fields**
 * @example say you want sort for a nested field.
 * collection = [{ score: { grade : A+, marks: 80 }}....], Now if you want to sort by marks field you can specify the const sortObj: SortObj = { marks: { type: number, databaseKey = 'score.marks' }}, thus you can sort by the nested field too. */
export interface SortObject {
  [key: string]: {
    type: SortTypes,
    databaseKey?: string,
    nullReplacementKey?: string,
    nullReplacementValue?: unknown
  }
}