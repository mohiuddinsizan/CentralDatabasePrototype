import mongoose from "mongoose";
import dotenv from "dotenv";
import Tag from "../models/Tag.js";
import slugify from "../utils/slugify.js";

dotenv.config();

const DEFAULT_TAGS = [
  "Creative",
  "Board Question",
  "Important",
  "Common",
  "Easy",
  "Medium",
  "Hard",
  "Model Test",
  "Admission",
  "Short",
  "Long",
  "Conceptual",
  "Analytical",
  "Repeated",
  "Suggested",
];

async function seedTags() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const name of DEFAULT_TAGS) {
      const slug = slugify(name);
      const exists = await Tag.findOne({ slug });

      if (!exists) {
        await Tag.create({ name, slug });
        console.log(`Inserted: ${name}`);
      } else {
        console.log(`Skipped: ${name}`);
      }
    }

    console.log("Tag seeding done");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seedTags();