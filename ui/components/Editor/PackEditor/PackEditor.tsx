import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { createPack, editPack } from "../../../../api/firebase";
import { Difficulty } from "../../../../enums";
import { useAuth } from "../../../../hooks";
import { AppPacks, LocalPuzzlePack, PuzzlePack } from "../../../../types";
import { Button } from "../../Button/Button";
import { RectangularDropzone } from "../../Dropzone/RectangularDropzone";
import { PuzzleGrid } from "../../Grid/PuzzleGrid";
import { DifficultyRadioGroup } from "../../RadioGroup/DifficultyRadioGroup";
import { EditorWrapper } from "../EditorWrapper";
import { PuzzleEditor } from "../PuzzleEditor";
import _ from "lodash";
import style from "./PackEditor.module.css";

interface PackEditorProps {
  currentPack?: PuzzlePack | LocalPuzzlePack;
  setPacks?: Dispatch<SetStateAction<AppPacks>>
}

export default function PackEditor({ currentPack, setPacks }: PackEditorProps) {
  const [checkedDifficulty, setCheckedDifficulty] = useState<any>(Difficulty.F);
  const [puzzleEditorIsOpen, setPuzzleEditorIsOpen] = useState<boolean>(false);
  const [backup, setBackup] = useState<PuzzlePack | LocalPuzzlePack>();
  const methods = useForm();
  const { register, handleSubmit, setValue, watch, reset } = methods;
  const values = watch();
  const { pack } = values;
  const { user } = useAuth();

  useEffect(() => {
    register("difficulty");
    register("puzzles", { value: pack?.puzzles || [] });
  });

  useEffect(() => {
    if (currentPack) {
      reset();
      setBackup(currentPack);
      setValue("pack", currentPack);
      setValue("puzzles", currentPack?.puzzles);
      setValue("cover", currentPack?.cover);
      setValue("title", currentPack?.title);
      setCheckedDifficulty(currentPack?.difficulty);
      console.log(values);
    }
  }, [currentPack]);

  useEffect(() => {
    checkedDifficulty && setValue("difficulty", checkedDifficulty);
  }, [checkedDifficulty, setValue]);

  return (
    <EditorWrapper>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(async (data) => {
            try {
              if (user) {
                const pack = {
                  title: data.title,
                  author: user.uid,
                  difficulty: data.difficulty,
                };

                const cover = typeof data.cover === "string" ? data.cover : data.cover[0];

                const newPack = {
                  id: currentPack?.id,
                  ...pack,
                  puzzles: data.puzzles,
                  cover,
                }

                if (_.isEqual(backup, newPack)) return;

                if (currentPack?.local) {
                  const result = await createPack({
                    pack,
                    cover: data.cover[0],
                    puzzles: data.puzzles,
                  });

                  setPacks?.((prev) => {
                    let local = prev.local;
                    let remote = prev.remote;
                    local = local.filter((pack) => pack.id !== currentPack?.id);
                    remote.push(result);

                    return {
                      local, remote
                    }
                  });
                  toast("Pack cree avec succes");
                } else {
                  console.log("Edit pack");
                  if (currentPack && currentPack.id) {
                    const result = await editPack({
                      id: currentPack.id,
                      title: data.title,
                      difficulty: data?.difficulty,
                      cover,
                    })
                    console.log("After update: ", result);
                    toast("Pack edit avec succes");
                  }
                }
              }
            } catch (error) {
              console.error(error);
              toast("Erreur lors de la creation du pack");
            }
          })}
        >
          <p>Couverture</p>
          <RectangularDropzone
            label="Telecharger une image"
            src={pack?.cover}
            {...register("cover")}
          />

          <p>Titre</p>
          <input
            type="text"
            placeholder="Trouvez un titre pour votre pack..."
            value={values.title}
            {...register("title")}
          />

          <p>Difficulte</p>
          <small>Veuillez choisir une difficulte pour votre pack</small>
          <DifficultyRadioGroup
            checkedDifficulty={checkedDifficulty}
            setCheckedDifficulty={setCheckedDifficulty}
          />

          {!puzzleEditorIsOpen && (
            <>
              <p>Liste des énigmes</p>
              <PuzzleGrid puzzles={values.puzzles} />
              <Button
                onClick={() => {
                  setPuzzleEditorIsOpen(true);
                  window.scrollTo(0, document.body.scrollHeight);
                }}
              >
                Ajouter un puzzle
              </Button>
            </>
          )}

          {!puzzleEditorIsOpen && (
            <input
              type="submit"
              value="Sauvegarder"
              style={{
                marginTop: "0.5em",
                backgroundColor: "white",
                color: "black",
              }}
              className={`${style.action}`}
            />
          )}
        </form>
        {puzzleEditorIsOpen && (
          <PuzzleEditor
            isOpen={puzzleEditorIsOpen}
            setIsOpen={setPuzzleEditorIsOpen}
          />
        )}
      </FormProvider>
    </EditorWrapper>
  );
}
