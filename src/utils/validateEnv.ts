import chalk from "chalk";

export default function validateEnv(): void {
  let isValid = true;

  const requiredEnvVars: (keyof NodeJS.ProcessEnv)[] = [
    "BOT_TOKEN",
    "TEST_GUILD_ID",
    "DB_URL",
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.log(chalk.red("MISSING ENV VAR: ") + envVar);
      isValid = false;
    }
  }

  if (!isValid) process.exit(1);
}
