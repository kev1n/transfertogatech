// Type Definitions

interface OR {
  OR: string[];
}

interface AND {
  AND: string[];
}
interface Requirement {
  AND?: string[];
  OR?: string[];
}

interface MajorRequirement {
  [key: string]: Requirement;
}

interface Majors {
  [key: string]: {
    requirements: MajorRequirement;
  };
}

interface BuiltMajor {
  name: string;
  requirements: MajorRequirement;
}

class MajorBuilder {
  private major: BuiltMajor;

  //all majors need english and math
  constructor(majorName: string) {
    this.major = {
      name: majorName,
      requirements: {
        ENGLISH: {
          AND: ["ENGL 1101", "ENGL 1102"],
        },
        MATH: {
          AND: ["MATH 1551"],
        },
      },
    };
  }

  addCalc2(): MajorBuilder {
    if (this.major.requirements.MATH) {
      const m = this.major.requirements.MATH.AND! as string[];
      m.push("MATH 1552");
    }
    return this;
  }

  addBiology1(): MajorBuilder {
    this.major.requirements.BIOLOGY = {
      OR: ["BIOS 1107", "BIOS 1108"],
    };
    return this;
  }

  addBiology1AND2(): MajorBuilder {
    this.major.requirements.BIOLOGY = {
      AND: ["BIOS 1107", "BIOS 1108"],
    };
    return this;
  }

  addChem1(): MajorBuilder {
    this.major.requirements.CHEM1 = {
      OR: ["CHEM 1211K", "CHEM 1310"],
    };
    return this;
  }

  addChem2(): MajorBuilder {
    this.major.requirements.CHEM2 = {
      AND: ["CHEM 1212"],
    };
    return this;
  }

  addPhys(): MajorBuilder {
    this.major.requirements.PHYS = {
      AND: ["PHYS 2211"],
    };
    return this;
  }

  addLabScienceElective1(): MajorBuilder {
    this.major.requirements.LAB1 = {
      OR: [
        "CHEM 1211K",
        "CHEM 1212K",
        "CHEM 1310",
        "BIOS 1220",
        "BIOS 1107",
        "BIOS 1107L",
        "BIOS 1108",
        "BIOS 1108L",
        "EAS 1600",
        "EAS 1601",
        "EAS 2600",
        "PHYS 2211",
        "PHYS 2212",
      ],
    };
    return this;
  }

  addLabScienceElective2(): MajorBuilder {
    this.major.requirements.LAB2 = {
      OR: [
        "CHEM 1211K",
        "CHEM 1212K",
        "CHEM 1310",
        "BIOS 1220",
        "BIOS 1107",
        "BIOS 1107L",
        "BIOS 1108",
        "BIOS 1108L",
        "EAS 1600",
        "EAS 1601",
        "EAS 2600",
        "PHYS 2211",
        "PHYS 2212",
      ],
    };
    return this;
  }

  addComputerScience(): MajorBuilder {
    this.major.requirements.CS = {
      OR: ["CS 1301", "CS 1371"],
    };
    return this;
  }

  build(): BuiltMajor {
    return this.major;
  }
}

function starterMajor(majorName: string): MajorBuilder {
  return new MajorBuilder(majorName);
}

export const majors = [
  starterMajor("Aerospace Engineering").addCalc2().addChem1().addPhys().build(),
  starterMajor("Applied Languages and Intercultural Studies").addLabScienceElective1().addLabScienceElective2().build(),
  starterMajor("Applied Physics").addCalc2().addChem1().addPhys().build(),
  starterMajor("Architecture").addPhys().build(),
  starterMajor("Atmospheric and Oceanic Sciences").addCalc2().addChem1().addPhys().build(),
  starterMajor("Biochemistry").addCalc2().addChem1().addChem2().addPhys().build(),
  starterMajor("Biology").addCalc2().addChem1().addChem2().addPhys().build(),
  starterMajor("Biomedical Engineering").addCalc2().addChem1().addPhys().build(),
  starterMajor("Building Construction").addPhys().build(),
  starterMajor("Business Administration").addCalc2().addLabScienceElective1().addLabScienceElective2().build(),
  starterMajor("Chemical and Biomolecular Engineering").addCalc2().addChem1().addPhys().build(),
  starterMajor("Chemistry").addCalc2().addChem1().addChem2().build(),
  starterMajor("Civil Engineering").addCalc2().addChem1().addPhys().build(),
  starterMajor("Computational Media").addCalc2().addLabScienceElective1().addLabScienceElective2().addComputerScience().build(),
  starterMajor("Computer Engineering").addCalc2().addChem1().addPhys().addComputerScience().build(),
  starterMajor("Computer Science").addCalc2().addLabScienceElective1().addLabScienceElective2().addComputerScience().build(),
  starterMajor("Earth and Atmospheric Sciences").addCalc2().addChem1().addPhys().build(),
  starterMajor("Economics").addLabScienceElective1().addLabScienceElective2().build(),
  starterMajor("Economics & International Affairs").addLabScienceElective1().addLabScienceElective2().build(),
  starterMajor("Electrical Engineering").addCalc2().addChem1().addPhys().addComputerScience().build(),
  starterMajor("Environmental Engineering").addCalc2().addChem1().addPhys().build(),
  starterMajor("Enviornmental Science").addCalc2().addChem1().addPhys().build(),
  starterMajor("Global Economics and Modern Languages").addLabScienceElective1().addLabScienceElective2().build(),
  starterMajor("History, Technology, and Society").addLabScienceElective1().addLabScienceElective2().build(),
  starterMajor("Industrial Design").addPhys().build(),
  starterMajor("Industrial Engineering").addCalc2().addPhys().addLabScienceElective1().build(),
  starterMajor("International Affairs").addLabScienceElective1().addLabScienceElective2().build(),
  starterMajor("International Affairs & Modern Language").addLabScienceElective1().addLabScienceElective2().build(),
  starterMajor("Literature, Media, and Communication").addLabScienceElective1().addLabScienceElective2().build(),
  starterMajor("Materials Science and Engineering").addCalc2().addChem1().addPhys().build(),
  starterMajor("Mathematics").addCalc2().addPhys().addLabScienceElective1().build(),
  starterMajor("Mechanical Engineering").addCalc2().addChem1().addPhys().build(),
  starterMajor("Music Technology").addPhys().build(),
  starterMajor("Neuroscience").addCalc2().addBiology1().addChem1().build(),
  starterMajor("Nuclear and Radiological Engineering").addCalc2().addChem1().addPhys().build(),
  starterMajor("Physics").addCalc2().addChem1().addPhys().build(),
  starterMajor("Psychology").addCalc2().addBiology1AND2().build(),
  starterMajor("Public Policy").addLabScienceElective1().addLabScienceElective2().build(),
  starterMajor("Solid Earth and Planetary Sciences").addCalc2().addChem1().addPhys().build(),
]
