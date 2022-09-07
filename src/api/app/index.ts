import { updateProfile } from "firebase/auth";
import { FieldValues } from "react-hook-form";
import { Difficulty } from "../../enums";
import { notifySuccess } from "../../lib/notifications";
import { Pack, Puzzle, Puzzles } from "../../types";
import { createPack, deletePack, deletePuzzle, signUp, uploadProfilePicture } from "../firebase";
interface SubmitCreatePackParams {
    pack: {
        title: string;
        authorId: string;
        difficulty: Difficulty;
    };
    cover: File;
    puzzles: Puzzles;
}


// API Calls

export async function submitRegister(data: FieldValues) {
    const tasks: Array<Promise<string | void>> = [];
    const { email, password, username, avatar } = data;
    const { user } = await signUp({ email, password });

    tasks.push(updateProfile(user, { displayName: username }));
    if (avatar instanceof FileList && avatar.length !== 0) {
        tasks.push(uploadProfilePicture(avatar[0], user));
    }
    await Promise.all(tasks);
}

export async function submitDeletePack(pack: Pack) {
    pack.online && (await deletePack(pack.id.toString()));
}


export async function submitDeletePuzzle(puzzle: Puzzle) {
    puzzle?.online && (await deletePuzzle(puzzle.id));
}


export async function submitCreatePack({ pack, cover, puzzles }: SubmitCreatePackParams) {
    const result = await createPack({
        pack,
        cover,
        puzzles,
    });
    return result;
}