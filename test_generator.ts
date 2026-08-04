import { generateExamQuestionsForPack, generateExamWritingTasksForPack } from "./src/utils/courseGenerator";
import { PACK_CONFIGS } from "./src/utils/subscriptionEngine";

try {
  console.log("Testing listening with standard pack...");
  const listening = generateExamQuestionsForPack([], "standard", PACK_CONFIGS["standard"], "listening");
  console.log("Listening success! Count:", listening.length);
} catch (err) {
  console.error("Listening error:", err);
}

try {
  console.log("Testing writing with vip pack...");
  const writing = generateExamWritingTasksForPack([], "vip", PACK_CONFIGS["vip"], "writing");
  console.log("Writing success! Count:", writing.length);
} catch (err) {
  console.error("Writing error:", err);
}
