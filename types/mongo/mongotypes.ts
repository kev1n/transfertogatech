export type SchoolEquivalency = {
  _id: string;
  school: string;
  equivalents: Class[];
  term: string;
};

export interface Class {
  className: string;
  title: string;
  level: string;
  minimumGrade: string;
  gaEquivalent: string;
  gaEquivalentTitle: string;
  creditHours: string;
}

export interface School {
  id: string;
  name: string;
  state: string;
}
