import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IPerson extends Document {
  uuid: string;
  name: string;
  surname: string;
  personalId: string;
  status: "Activo" | "Inactivo";
  dateOfEntry: Date;
  pep: boolean;
  os: boolean;
}

const PersonSchema: Schema = new Schema<IPerson>({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
    maxlength: 50,
  },
  surname: {
    type: String,
    required: true,
    maxlength: 50,
  },
  personalId: {
    type: String,
    required: true,
    maxlength: 10,
  },
  status: {
    type: String,
    enum: ["Activo", "Inactivo"],
    required: true,
  },
  dateOfEntry: {
    type: Date,
    required: true,
  },
  pep: {
    type: Boolean,
    required: true,
  },
  os: {
    type: Boolean,
    required: true,
  },
});

export default mongoose.model<IPerson>("Person", PersonSchema);
