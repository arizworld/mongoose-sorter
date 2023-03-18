import { PipelineStage } from "mongoose";
import { SortObject } from "./typings/sorter";


export class Sorter {
    _config: SortObject | null = null
    private static _instance : Sorter | null = null
    /**
     * This method applies the config on your imported module and you can start the sorting. ✨🎉
     * @param config this is the main configuration for how you want the sorter to behave.
     * 
     */
    apply(config: SortObject){
        this._config = config
    }

    static get instance(): Sorter {
        if(!this._instance){
            this._instance = new Sorter()
        }
        return this._instance
    }


    /** This method generates the whole sort pipeline for the mongoose aggregation dynamically for different values of sortQuery.
     * @param sortQuery is a string where you can specify the query for the sort.Like if you want to sort by name ascending and score descending then sortQuery='name,-score'.
     * @param willYouProject you can set it to be true if you use $project in later stages of your pipeline. Thus it will be more efficient.
     * @param defaultSort you can set it if you want the fallback sort nature to be something else than { _id: 1 }
     * @param log you can set it to true if you want to log the returned pipeline
     * @example
     * collection = [{ name:string, score:number, created_at:date, section:array}....]
     *
     * import sorter from 'mongoose-sorter'
     * const sortObject: SortObject = { name: { type: string},score: { type: number}, sectionLength: { type: array, databaseKey: 'section'}, date: { type: date, databaseKey: 'created_at'}}
     * sorter.apply(sortObject)
     * await model.aggregate([
     * {pipelineStages},
     * ...sorter.generateSortPipeline(req.query.sort as string,false,{ name: 1})
     * ])
     */
    generateSortPipeline(sortQuery?: string, willYouProject?: boolean, defaultSort: { [key: string]: 1 | -1 } = { _id: 1 },log = false): PipelineStage[] {
        if(!this._config) throw new Error('The sorting config is not applied yet!')
        const config = this._config
        if (!sortQuery) return [{ $sort: defaultSort }]
        if (typeof sortQuery !== 'string') throw new Error(`Type of sort query must be string,received ${typeof sortQuery}`)
      
        const sortPipeline: PipelineStage[] = []
        const sortStage: { [key: string]: 1 | -1 } = {}
        const setStage: { [key: string]: string | object } = {}
        const unsetStage: string[] = []
      
        const validSortFields = sortQuery.split(',').filter(el => {
          // eslint-disable-next-line no-prototype-builtins
          return config.hasOwnProperty(el.replace('-', ''))
        })
      
        if (!validSortFields.length) return [{ $sort: defaultSort }]
      
        let needSetStage: 0 | 1 = 0
        for (const field of validSortFields) {
          const fieldName = field.replace('-', '')
          const databaseKey = config[fieldName].databaseKey ? config[fieldName].databaseKey as string : fieldName
          const nullReplacementKey = config[fieldName].nullReplacementKey
          const nullReplacementValue = config[fieldName].nullReplacementValue
          switch (config[fieldName].type) {
            case 'string':
              // TODO ifNull implementation
              needSetStage = 1
              setStage[`${databaseKey}_1`] = { $toLower: `$${databaseKey}` }
              sortStage[`${databaseKey}_1`] = field.charAt(0) === '-' ? -1 : 1
              unsetStage.push(`${databaseKey}_1`)
              break;
            case 'array':
              // TODO ifNull implementation
              needSetStage = 1
              setStage[`${databaseKey}_1`] = { $size: `$${databaseKey}` }
              sortStage[`${databaseKey}_1`] = field.charAt(0) === '-' ? -1 : 1
              unsetStage.push(`${databaseKey}_1`)
              break;
            case 'date':
              if (nullReplacementKey || nullReplacementValue) {
                needSetStage = 1
                setStage[`${databaseKey}_1`] = { $ifNull: [`$${databaseKey}`, `$${nullReplacementKey}`, nullReplacementValue] }
                sortStage[`${databaseKey}_1`] = field.charAt(0) === '-' ? -1 : 1
                unsetStage.push(`${databaseKey}_1`)
                break;
              }
              sortStage[databaseKey] = field.charAt(0) === '-' ? -1 : 1
              break;
            case 'number':
            // fall through
            case 'boolean':
              sortStage[databaseKey] = field.charAt(0) === '-' ? -1 : 1
              break;
            default:
              return [{ $sort: defaultSort }]
          }
        }
        if (needSetStage) {
          sortPipeline.push({ $set: setStage }, { $sort: sortStage })
          if (!willYouProject) { sortPipeline.push({ $unset: unsetStage }) }
          return sortPipeline
        }
        sortPipeline.push({ $sort: sortStage })
        if(log) console.log(JSON.stringify(sortPipeline,null,'  ')) 
        return sortPipeline
    }
}
export default new Sorter()