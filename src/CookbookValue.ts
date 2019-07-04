export default class CookbookValue {
    constructor(public id: number,
                public title: string,
                public description: string,
                public author: string,
                public sharedWith: string[]) {
    }
}
