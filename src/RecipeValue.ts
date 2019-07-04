export default class RecipeValue {
    constructor(public title: string,
                public subtitle: string,
                public tags: string[],
                public ingredients: string[],
                public ratings: {
                    repeat: number,
                    cost: number,
                    time: number,
                    tastiness: number,
                }) {
    }
}
