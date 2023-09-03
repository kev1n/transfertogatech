"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Option {
  value: string;
  label: string;
}
interface ComboboxFormProps {
  optionsFetcher: () => Promise<Option[]>;
  placeholder: string;
  noOptionsMessage: string;
  searchString: string;
  value: string;
  setValue: (value: string) => void;
  label: string;
  setLabel: (label: string) => void;
}

export function Combobox(props: ComboboxFormProps) {
  const {
    optionsFetcher,
    placeholder,
    noOptionsMessage,
    searchString,
    value,
    setValue,
    label,
    setLabel,
  } = props;
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    []
  );

  useEffect(() => {
    if (options.length) {
      return;
    }
    const unsortedOptions = optionsFetcher();
    unsortedOptions.then((options) => {
      options.sort((a, b) => a.label.localeCompare(b.label));
      setOptions(options);
    });
  }, [options]);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonWidth, setButtonWidth] = useState(500);

  useEffect(() => {
    const handleResize = () => {
      if (buttonRef.current) {
        setButtonWidth(buttonRef.current.offsetWidth);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [buttonRef]);

  useEffect(() => {
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
  }, [buttonRef]);

  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          ref={buttonRef}
        >
          {value ? label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 h-[200px]" style={{ width: buttonWidth }}>
        <Command>
          <CommandInput placeholder={searchString} />
          <CommandEmpty>{noOptionsMessage}</CommandEmpty>
          <ScrollArea className="h-96">
            <CommandGroup>
              {options.length &&
                options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={(currentValue) => {
                      if (currentValue === value) {
                        setValue("");
                        setLabel("");
                      } else {
                        setValue(option.value);
                        setLabel(option.label);
                      }
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
            </CommandGroup>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
