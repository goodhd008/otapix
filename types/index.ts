import { Difficulty } from "../enums";

export interface HasID {
    id: string | number;
}

export interface HasAuthor {
    author: string;
}

export interface HasCover {
    cover: string;
}

export interface HasTitle {
    title: string;
}

export interface IdentifiableCreation extends HasID, HasAuthor { }

export interface FormField {
    label: string;
    placeholder: string;
    type: string;
    name?: string;
    className?: string;
}

export interface Puzzle extends HasID {
    word: string;
    universe: string;
    pictures: Array<string>;
    order: number;
}

export interface PuzzlePack extends IdentifiableCreation, HasCover, HasTitle {
    difficulty: Difficulty;
    // rating: number;
    // playCount: number;
    puzzles: Array<Puzzle>;
}
