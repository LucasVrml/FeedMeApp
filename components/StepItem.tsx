"use client";

import { Cross, Trash } from "lucide-react";
import Image from "next/image";
import { useCallback } from "react";
import ContentEditable from "react-contenteditable";

const StepItem = ({
  step,
  index,
  steps,
  setSteps,
}: {
  step: string;
  index: number;
  steps: string[];
  setSteps: Function;
}) => {
  const onContentChange = useCallback(
    //@ts-ignore
    (evt) => {
      const newSteps = [...steps];
      newSteps[index] = evt.currentTarget.innerHTML;
      setSteps(newSteps);
    },
    [setSteps, index, steps]
  );

  function deleteStep() {
    const newSteps = steps.filter((item) => item !== step);
    setSteps(newSteps);
  }

  return (
    <>
      <li className="pb-2 text-left align-middle flex items-center gap-x-3">
        <ContentEditable
          className="outline-none inline overflow-auto w-[90%]"
          onChange={onContentChange}
          html={step}
        ></ContentEditable>
        <div className="flex justify-center items-center w-[10%]">
          <div
            onClick={deleteStep}
            className="flex justify-center items-center cursor-pointer transition-all p-2 aspect-square rounded-sm hover:bg-slate-100 dark:hover:bg-neutral-800"
          >
            <Trash size={20} />
          </div>
        </div>
      </li>
    </>
  );
};

export default StepItem;
