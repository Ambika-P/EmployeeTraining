import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import clsx from "clsx";

interface Option {
    [key: string]: any;
}

interface MultiSelectProps {
    label: string;
    options: Option[];
    selected: Option[];
    onChange: (value: Option[]) => void;
    labelKey: string;
}

export function MultiSelect({ label, options, selected, onChange, labelKey }: MultiSelectProps) {
    const handleToggle = (option: Option) => {
        const exists = selected.find((o) => o.id === option.id);
        if (exists) {
            onChange(selected.filter((o) => o.id !== option.id));
        } else {
            onChange([...selected, option]);
        }
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </label>
            <Listbox value={selected} onChange={() => { }}>
                <div className="relative">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg border bg-white dark:bg-slate-800 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none sm:text-sm">
                        <span className="block truncate font-normal">
                            {selected.length > 0
                                ? selected.map((s) => s[labelKey]).join(", ")
                                : "Select..."}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </span>
                    </Listbox.Button>

                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-900 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {options.map((option) => (
                                <Listbox.Option
                                    key={option.id}
                                    value={option}
                                    as={Fragment}
                                >
                                    {({ active }) => (
                                        <li
                                            className={clsx(
                                                "cursor-pointer select-none relative px-4 py-2 flex items-center",
                                                active ? "bg-slate-100 dark:bg-slate-700" : ""
                                            )}
                                            onClick={() => handleToggle(option)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={!!selected.find((s) => s.id === option.id)}
                                                readOnly
                                                className="mr-2"
                                            />
                                            <span className="block truncate">{option[labelKey]}</span>
                                            {selected.find((s) => s.id === option.id) && (
                                                <Check className="absolute right-3 h-4 w-4 text-green-500" />
                                            )}
                                        </li>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
}
