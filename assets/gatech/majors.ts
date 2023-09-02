// Type Definitions

interface OR {
  OR: string[];
}

interface AND {
  AND: string[];
}
export interface Requirement {
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
  public major: BuiltMajor;

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

type MajorExport = {
  [key: string]: BuiltMajor;
};

export const majors: MajorExport = {
  "Aerospace Engineering": starterMajor("Aerospace Engineering").addCalc2().addChem1().addPhys().build(),
  "Applied Languages and Intercultural Studies": starterMajor("Applied Languages and Intercultural Studies").addLabScienceElective1().addLabScienceElective2().build(),
  "Applied Physics": starterMajor("Applied Physics").addCalc2().addChem1().addPhys().build(),
  "Architecture": starterMajor("Architecture").addPhys().build(),
  "Atmospheric and Oceanic Sciences": starterMajor("Atmospheric and Oceanic Sciences").addCalc2().addChem1().addPhys().build(),
  "Biochemistry": starterMajor("Biochemistry").addCalc2().addChem1().addChem2().addPhys().build(),
  "Biology": starterMajor("Biology").addCalc2().addChem1().addChem2().addPhys().build(),
  "Biomedical Engineering": starterMajor("Biomedical Engineering").addCalc2().addChem1().addPhys().build(),
  "Building Construction": starterMajor("Building Construction").addPhys().build(),
  "Business Administration": starterMajor("Business Administration").addCalc2().addLabScienceElective1().addLabScienceElective2().build(),
  "Chemical and Biomolecular Engineering": starterMajor("Chemical and Biomolecular Engineering").addCalc2().addChem1().addPhys().build(),
  "Chemistry": starterMajor("Chemistry").addCalc2().addChem1().addChem2().build(),
  "Civil Engineering": starterMajor("Civil Engineering").addCalc2().addChem1().addPhys().build(),
  "Computational Media": starterMajor("Computational Media").addCalc2().addLabScienceElective1().addLabScienceElective2().addComputerScience().build(),
  "Computer Engineering": starterMajor("Computer Engineering").addCalc2().addChem1().addPhys().addComputerScience().build(),
  "Computer Science": starterMajor("Computer Science").addCalc2().addLabScienceElective1().addLabScienceElective2().addComputerScience().build(),
  "Earth and Atmospheric Sciences": starterMajor("Earth and Atmospheric Sciences").addCalc2().addChem1().addPhys().build(),
  "Economics": starterMajor("Economics").addLabScienceElective1().addLabScienceElective2().build(),
  "Economics & International Affairs": starterMajor("Economics & International Affairs").addLabScienceElective1().addLabScienceElective2().build(),
  "Electrical Engineering": starterMajor("Electrical Engineering").addCalc2().addChem1().addPhys().addComputerScience().build(),
  "Environmental Engineering": starterMajor("Environmental Engineering").addCalc2().addChem1().addPhys().build(),
  "Enviornmental Science": starterMajor("Enviornmental Science").addCalc2().addChem1().addPhys().build(),
  "Global Economics and Modern Languages": starterMajor("Global Economics and Modern Languages").addLabScienceElective1().addLabScienceElective2().build(),
  "History, Technology, and Society": starterMajor("History, Technology, and Society").addLabScienceElective1().addLabScienceElective2().build(),
  "Industrial Design": starterMajor("Industrial Design").addPhys().build(),
  "Industrial Engineering": starterMajor("Industrial Engineering").addCalc2().addPhys().addLabScienceElective1().build(),
  "International Affairs": starterMajor("International Affairs").addLabScienceElective1().addLabScienceElective2().build(),
  "International Affairs & Modern Language": starterMajor("International Affairs & Modern Language").addLabScienceElective1().addLabScienceElective2().build(),
  "Literature, Media, and Communication": starterMajor("Literature, Media, and Communication").addLabScienceElective1().addLabScienceElective2().build(),
  "Materials Science and Engineering": starterMajor("Materials Science and Engineering").addCalc2().addChem1().addPhys().build(),
  "Mathematics": starterMajor("Mathematics").addCalc2().addPhys().addLabScienceElective1().build(),
  "Mechanical Engineering": starterMajor("Mechanical Engineering").addCalc2().addChem1().addPhys().build(),
  "Music Technology": starterMajor("Music Technology").addPhys().build(),
  "Neuroscience": starterMajor("Neuroscience").addCalc2().addBiology1().addChem1().build(),
  "Nuclear and Radiological Engineering": starterMajor("Nuclear and Radiological Engineering").addCalc2().addChem1().addPhys().build(),
  "Physics": starterMajor("Physics").addCalc2().addChem1().addPhys().build(),
  "Psychology": starterMajor("Psychology").addCalc2().addBiology1AND2().build(),
  "Public Policy": starterMajor("Public Policy").addLabScienceElective1().addLabScienceElective2().build(),
  "Solid Earth and Planetary Sciences": starterMajor("Solid Earth and Planetary Sciences").addCalc2().addChem1().addPhys().build(),
}

export const majorsList = [
  "Aerospace Engineering",
  "Applied Languages and Intercultural Studies",
  "Applied Physics",
  "Architecture",
  "Atmospheric and Oceanic Sciences",
  "Biochemistry",
  "Biology",
  "Biomedical Engineering",
  "Building Construction",
  "Business Administration",
  "Chemical and Biomolecular Engineering",
  "Chemistry",
  "Civil Engineering",
  "Computational Media",
  "Computer Engineering",
  "Computer Science",
  "Earth and Atmospheric Sciences",
  "Economics",
  "Economics & International Affairs",
  "Electrical Engineering",
  "Environmental Engineering",
  "Enviornmental Science",
  "Global Economics and Modern Languages",
  "History, Technology, and Society",
  "Industrial Design",
  "Industrial Engineering",
  "International Affairs",
  "International Affairs & Modern Language",
  "Literature, Media, and Communication",
  "Materials Science and Engineering",
  "Mathematics",
  "Mechanical Engineering",
  "Music Technology",
  "Neuroscience",
  "Nuclear and Radiological Engineering",
  "Physics",
  "Psychology",
  "Public Policy",
  "Solid Earth and Planetary Sciences",
];

export async function getMajors() {
  //return the list as {value: {major}, label: {major}}
  return Object.entries(majors).map(([key, value]) => ({
    value: key,
    label: key,
  }));
}