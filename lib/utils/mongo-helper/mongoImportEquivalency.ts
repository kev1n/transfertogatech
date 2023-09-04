import { MongoClient } from "mongodb";
import { School } from "@/types/mongo/mongotypes";
import getAllSubjectsInSchool from "../api-helper/getAllSubjectsInSchool";
import getEquivalencyForSchool from "../api-helper/getEquivalencyForSchool";

export default async function mongoImportEquivalency(
  client: MongoClient,
  school: School,
  retryCount = 0
) {
  try {
    const db = client.db("transfer");
    const collection = db.collection("equivalents");

    const schoolData = await getAllSubjectsInSchool(school.state, school.id);
    const term = schoolData.terms[0].id;

    const equivalents = await getEquivalencyForSchool(
      school.state,
      school.id,
      schoolData.subjects,
      term
    );

    const filter = { _id: school.id };
    const update = {
      $set: {
        _id: school.id,
        school: school.name,
        equivalents: equivalents,
        term: term,
      },
    };
    const options = { upsert: true };

    collection.updateOne(filter, update, options);

    console.log(
      `Imported ${equivalents.length} equivalencies for ${school.name}`
    );
  } catch (error) {
    console.log(error);
    if (retryCount < 3) {
      console.log(`Retrying ${school.name}`);
      await mongoImportEquivalency(client, school, retryCount + 1);
    }
  }
}
