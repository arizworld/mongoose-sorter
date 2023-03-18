import model from './model'
import sorter, { SortObject } from '../index'
const ONE_DAY = 86400 * 1000 //in milliseconds


describe('Sorting Test Cases', () => {
    const data = [
        {
            name: "maths", score: 99, arr: ['some', 'kind', 'of', 'array'], marks: { grade: 'A+', score: 99 }, updated_at: new Date()
        },
        {
            name: "maths", score: 95, arr: ['some', 'kind', 'of', 'array'], marks: { grade: 'A+', score: 95 }, created_at: new Date(Date.now() - ONE_DAY)
        },
        {
            name: "autonomy", score: 90, arr: ['some', 'kind', 'of'], marks: { grade: 'A+', score: 90 }, created_at: new Date(Date.now() - 2 * ONE_DAY)
        },
        {
            name: "autonomy1", score: 85, arr: ['some', 'kind', 'of'], marks: { grade: '+', score: 85 }, updated_at: new Date(Date.now() - 3 * ONE_DAY)
        },
        {
            name: "anatomy", score: 80, marks: { grade: 'A', score: 80 }
        }
    ]
    beforeAll(async () => {
        await model.insertMany(data)
    })
    afterAll(async () => (await model.deleteMany({})))
    const config: SortObject = {
        name: { type: 'string', nullReplacementValue: '' },
        score: { type: 'number', nullReplacementValue: 0 },
        arr: { type: 'array', databaseKey: 'arr', nullReplacementValue: [] },
        date: { type: 'date', databaseKey: 'updated_at', nullReplacementKey: 'created_at', nullReplacementValue: new Date() }
    }
    sorter.apply(config)
    it('should sort string type properly for ascending order', async () => {
        const result = await model.aggregate([...sorter.generateSortPipeline('name')])
        expect(result.length).toBe(5)
        expect(result.map(e => e.name)).toEqual(data.map(e => e.name).sort())
    })
    it('should sort string type properly for descending order', async () => {
        const result = await model.aggregate([...sorter.generateSortPipeline('-name')])
        expect(result.length).toBe(5)
        expect(result.map(e => e.name)).toEqual(data.map(e => e.name).sort().reverse())
    })
    it('should sort number type properly for ascending order', async () => {
        const result = await model.aggregate([...sorter.generateSortPipeline('score')])
        expect(result.length).toBe(5)
        expect(result.map(e => e.score)).toEqual(data.map(e => e.score).sort())
    })
    it('should sort number type properly for descending order', async () => {
        const result = await model.aggregate([...sorter.generateSortPipeline('-score')])
        expect(result.length).toBe(5)
        expect(result.map(e => e.score)).toEqual(data.map(e => e.score).sort().reverse())
    })
    it('should sort array type properly for ascending order', async () => {
        const result = await model.aggregate([...sorter.generateSortPipeline('arr')])
        expect(result.length).toBe(5)
        expect(result.map(e => e.arr.length)).toEqual(data.map(e => e.arr?.length || 0).sort())
    })
    it('should sort array type properly for descending order', async () => {
        const result = await model.aggregate([...sorter.generateSortPipeline('-arr')])
        expect(result.length).toBe(5)
        expect(result.map(e => e.arr.length)).toEqual(data.map(e => e.arr?.length || 0).sort().reverse())
    })
})