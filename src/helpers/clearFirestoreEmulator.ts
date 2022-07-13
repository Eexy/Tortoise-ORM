import axios from "axios";

export async function clearFirestoreEmulator() {
  await axios.delete("http://localhost:8080/emulator/v1/projects/demo-tortoise/databases/(default)/documents");
}