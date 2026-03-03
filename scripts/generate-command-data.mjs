import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");

const CONTEXTS = [
  { key: "local", titleSuffix: "Local", extra: {} },
  { key: "team", titleSuffix: "Team", extra: {} },
  {
    key: "ci",
    titleSuffix: "CI",
    extra: {
      npm: " --silent",
      yarn: " --silent",
      pnpm: " --reporter=silent",
      pip: " --quiet",
      python: " -q",
      flutter: " --machine",
      "react-native": " --verbose",
      expo: " --non-interactive",
      docker: " --quiet",
      kubernetes: " --v=2",
      aws: " --output json",
      terraform: " -no-color",
      github: " --json id"
    }
  },
  { key: "prod", titleSuffix: "Production", extra: {} },
  {
    key: "verbose",
    titleSuffix: "Verbose",
    extra: {
      npm: " --verbose",
      yarn: " --verbose",
      pnpm: " --reporter ndjson",
      pip: " -v",
      python: " -v",
      flutter: " -v",
      "react-native": " --verbose",
      expo: " --verbose",
      docker: " --log-level debug",
      kubernetes: " -v=6",
      aws: " --debug",
      terraform: " -no-color",
      github: " --verbose"
    }
  }
];

const TOOL_CATALOG = {
  git: {
    category: "Version Control",
    commands: [
      "git init",
      "git clone [REPO_URL]",
      "git checkout -b [BRANCH_NAME]",
      "git checkout [BRANCH_NAME]",
      "git branch -a",
      "git add .",
      "git commit -m \"[MESSAGE]\"",
      "git pull origin [BRANCH_NAME]",
      "git push origin [BRANCH_NAME]",
      "git reset --soft HEAD~1",
      "git reset --hard HEAD~1",
      "git rebase [BASE_BRANCH]",
      "git cherry-pick [COMMIT_SHA]",
      "git stash",
      "git stash pop",
      "git log --oneline --graph --decorate",
      "git diff",
      "git tag [TAG_NAME]",
      "git bisect start",
      "git remote -v"
    ]
  },
  docker: {
    category: "Containers",
    commands: [
      "docker build -t [IMAGE_NAME]:[TAG] .",
      "docker run -d --name [CONTAINER_NAME] -p [HOST_PORT]:[CONTAINER_PORT] [IMAGE_NAME]:[TAG]",
      "docker ps",
      "docker ps -a",
      "docker logs [CONTAINER_NAME]",
      "docker exec -it [CONTAINER_NAME] /bin/sh",
      "docker stop [CONTAINER_NAME]",
      "docker rm [CONTAINER_NAME]",
      "docker rmi [IMAGE_NAME]:[TAG]",
      "docker system prune -f",
      "docker compose up -d",
      "docker compose down",
      "docker compose logs -f",
      "docker volume ls",
      "docker network ls",
      "docker login",
      "docker push [IMAGE_NAME]:[TAG]",
      "docker pull [IMAGE_NAME]:[TAG]",
      "docker inspect [CONTAINER_NAME]",
      "docker stats"
    ]
  },
  npm: {
    category: "JavaScript",
    commands: [
      "npm init -y",
      "npm install",
      "npm install [PACKAGE_NAME]",
      "npm install -D [PACKAGE_NAME]",
      "npm uninstall [PACKAGE_NAME]",
      "npm run dev",
      "npm run build",
      "npm run test",
      "npm run lint",
      "npm run format",
      "npm audit",
      "npm audit fix",
      "npm outdated",
      "npm update",
      "npm cache clean --force",
      "npm pack",
      "npm publish",
      "npm ci",
      "npm list --depth=0",
      "npm config get registry"
    ]
  },
  yarn: {
    category: "JavaScript",
    commands: [
      "yarn install",
      "yarn add [PACKAGE_NAME]",
      "yarn add -D [PACKAGE_NAME]",
      "yarn remove [PACKAGE_NAME]",
      "yarn dev",
      "yarn build",
      "yarn test",
      "yarn lint",
      "yarn format",
      "yarn cache clean",
      "yarn outdated",
      "yarn upgrade",
      "yarn npm publish",
      "yarn workspaces list",
      "yarn workspaces foreach -v run test",
      "yarn constraints",
      "yarn dlx [PACKAGE_NAME]",
      "yarn why [PACKAGE_NAME]",
      "yarn set version stable",
      "yarn install --immutable"
    ]
  },
  pnpm: {
    category: "JavaScript",
    commands: [
      "pnpm install",
      "pnpm add [PACKAGE_NAME]",
      "pnpm add -D [PACKAGE_NAME]",
      "pnpm remove [PACKAGE_NAME]",
      "pnpm dev",
      "pnpm build",
      "pnpm test",
      "pnpm lint",
      "pnpm update",
      "pnpm audit",
      "pnpm dlx [PACKAGE_NAME]",
      "pnpm store prune",
      "pnpm publish",
      "pnpm recursive test",
      "pnpm recursive build",
      "pnpm why [PACKAGE_NAME]",
      "pnpm list --depth 0",
      "pnpm import",
      "pnpm patch [PACKAGE_NAME]",
      "pnpm install --frozen-lockfile"
    ]
  },
  react: {
    category: "Frontend",
    commands: [
      "npx create-react-app [APP_NAME]",
      "npm create vite@latest [APP_NAME] -- --template react-ts",
      "yarn create vite [APP_NAME] --template react-ts",
      "npm run dev",
      "npm run build",
      "npm run preview",
      "npm run test",
      "npm run lint",
      "npm run storybook",
      "npm run test:coverage",
      "npm install react-router-dom",
      "npm install @tanstack/react-query",
      "npm install -D @types/react @types/react-dom",
      "npm install zustand",
      "npm install redux react-redux",
      "npm install -D eslint-plugin-react-hooks",
      "npm install -D vitest @testing-library/react",
      "npm install -D @vitejs/plugin-react",
      "npm install -D @storybook/react-vite",
      "npm run eject"
    ]
  },
  "react-native": {
    category: "Mobile",
    commands: [
      "npx react-native init [APP_NAME]",
      "npx react-native run-android",
      "npx react-native run-ios",
      "npx react-native start",
      "npx react-native doctor",
      "npx react-native config",
      "npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ios/main.jsbundle",
      "npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle",
      "npx react-native log-android",
      "npx react-native log-ios",
      "npx react-native upgrade",
      "npx react-native clean-project-auto",
      "npx react-native info",
      "npx react-native codegen",
      "npx react-native link [PACKAGE_NAME]",
      "npx react-native unlink [PACKAGE_NAME]",
      "npx pod-install ios",
      "npx jetify",
      "npx react-native-asset",
      "npx react-native test"
    ]
  },
  expo: {
    category: "Mobile",
    commands: [
      "npx create-expo-app [APP_NAME]",
      "npx expo start",
      "npx expo start --tunnel",
      "npx expo start --lan",
      "npx expo prebuild",
      "npx expo run:android",
      "npx expo run:ios",
      "npx expo install [PACKAGE_NAME]",
      "npx expo doctor",
      "npx expo export",
      "npx expo publish",
      "npx expo login",
      "npx expo whoami",
      "npx expo diagnostics",
      "npx expo config --type public",
      "npx expo upgrade",
      "eas build --platform all",
      "eas submit --platform ios",
      "eas update --branch [BRANCH_NAME] --message \"[MESSAGE]\"",
      "eas device:list"
    ]
  },
  flutter: {
    category: "Mobile",
    commands: [
      "flutter create [APP_NAME]",
      "flutter pub get",
      "flutter pub add [PACKAGE_NAME]",
      "flutter pub upgrade",
      "flutter run",
      "flutter run -d chrome",
      "flutter run -d ios",
      "flutter run -d android",
      "flutter build apk",
      "flutter build ios",
      "flutter build web",
      "flutter test",
      "flutter analyze",
      "flutter doctor",
      "flutter clean",
      "flutter pub outdated",
      "flutter pub deps",
      "dart format .",
      "dart fix --apply",
      "flutter gen-l10n"
    ]
  },
  python: {
    category: "Python",
    commands: [
      "python -m venv .venv",
      "source .venv/bin/activate",
      "pip install -r requirements.txt",
      "pip install [PACKAGE_NAME]",
      "pip freeze > requirements.txt",
      "pytest",
      "pytest -k [TEST_PATTERN]",
      "pytest --maxfail=1",
      "black .",
      "ruff check .",
      "mypy .",
      "python -m http.server [PORT]",
      "python manage.py runserver",
      "python manage.py makemigrations",
      "python manage.py migrate",
      "uvicorn [APP_MODULE]:app --reload",
      "gunicorn [APP_MODULE]:app",
      "alembic upgrade head",
      "poetry install",
      "poetry run pytest"
    ]
  },
  springboot: {
    category: "Backend",
    commands: [
      "./mvnw clean",
      "./mvnw test",
      "./mvnw spring-boot:run",
      "./mvnw package",
      "./mvnw verify",
      "./mvnw dependency:tree",
      "./mvnw -DskipTests package",
      "./mvnw spring-boot:build-image",
      "./mvnw spotbugs:check",
      "./mvnw checkstyle:check",
      "./mvnw jacoco:report",
      "./mvnw versions:display-dependency-updates",
      "./mvnw flyway:migrate",
      "./mvnw liquibase:update",
      "./mvnw spring-boot:run -Dspring-boot.run.profiles=[PROFILE]",
      "./mvnw -P[PROFILE] spring-boot:run",
      "./mvnw dependency:analyze",
      "./mvnw help:effective-pom",
      "./mvnw test -Dtest=[TEST_CLASS]",
      "./mvnw clean install"
    ]
  },
  pip: {
    category: "Python",
    commands: [
      "pip install [PACKAGE_NAME]",
      "pip install -U [PACKAGE_NAME]",
      "pip uninstall [PACKAGE_NAME]",
      "pip list",
      "pip freeze",
      "pip show [PACKAGE_NAME]",
      "pip cache dir",
      "pip cache purge",
      "pip install -r requirements.txt",
      "pip wheel -r requirements.txt",
      "pip download [PACKAGE_NAME]",
      "pip check",
      "pip index versions [PACKAGE_NAME]",
      "pip config list",
      "pip config set global.index-url [URL]",
      "pip install pip-tools",
      "pip-compile requirements.in",
      "pip-sync requirements.txt",
      "pipdeptree",
      "pip install --upgrade pip"
    ]
  },
  kubernetes: {
    category: "DevOps",
    commands: [
      "kubectl get pods -A",
      "kubectl get deployments -A",
      "kubectl get services -A",
      "kubectl describe pod [POD_NAME] -n [NAMESPACE]",
      "kubectl logs [POD_NAME] -n [NAMESPACE]",
      "kubectl logs -f [POD_NAME] -n [NAMESPACE]",
      "kubectl exec -it [POD_NAME] -n [NAMESPACE] -- sh",
      "kubectl apply -f [FILE]",
      "kubectl delete -f [FILE]",
      "kubectl rollout status deployment/[DEPLOYMENT_NAME] -n [NAMESPACE]",
      "kubectl rollout restart deployment/[DEPLOYMENT_NAME] -n [NAMESPACE]",
      "kubectl port-forward svc/[SERVICE_NAME] [LOCAL_PORT]:[REMOTE_PORT] -n [NAMESPACE]",
      "kubectl top nodes",
      "kubectl top pods -A",
      "kubectl config get-contexts",
      "kubectl config use-context [CONTEXT_NAME]",
      "kubectl cluster-info",
      "kubectl get events -n [NAMESPACE] --sort-by=.metadata.creationTimestamp",
      "kubectl patch deployment [DEPLOYMENT_NAME] -n [NAMESPACE] -p '[PATCH_JSON]'",
      "kubectl api-resources"
    ]
  },
  aws: {
    category: "Cloud",
    commands: [
      "aws configure",
      "aws sts get-caller-identity",
      "aws s3 ls",
      "aws s3 cp [SOURCE] [DESTINATION]",
      "aws s3 sync [SOURCE] [DESTINATION]",
      "aws ec2 describe-instances",
      "aws ec2 start-instances --instance-ids [INSTANCE_ID]",
      "aws ec2 stop-instances --instance-ids [INSTANCE_ID]",
      "aws lambda list-functions",
      "aws lambda invoke --function-name [FUNCTION_NAME] out.json",
      "aws ecr get-login-password --region [REGION]",
      "aws ecs list-clusters",
      "aws iam list-users",
      "aws cloudformation list-stacks",
      "aws logs tail [LOG_GROUP] --follow",
      "aws dynamodb list-tables",
      "aws rds describe-db-instances",
      "aws eks list-clusters",
      "aws secretsmanager list-secrets",
      "aws configure list-profiles"
    ]
  },
  linux: {
    category: "Shell",
    commands: [
      "rg [PATTERN] [PATH]",
      "ls -la",
      "pwd",
      "cd [PATH]",
      "chmod +x [FILE_PATH]",
      "chown [USER]:[GROUP] [PATH]",
      "ps aux",
      "kill -9 [PID]",
      "df -h",
      "du -sh [PATH]",
      "curl -X GET [URL]",
      "wget [URL]",
      "ssh [USER]@[HOST]",
      "scp [SOURCE] [USER]@[HOST]:[DESTINATION]",
      "tar -czf [ARCHIVE_NAME].tar.gz [PATH]",
      "unzip [FILE_PATH]",
      "sed -n '[START],[END]p' [FILE_PATH]",
      "awk '{print $1}' [FILE_PATH]",
      "xargs -I {} echo {}",
      "history"
    ]
  },
  postgresql: {
    category: "Database",
    commands: [
      "psql -h [HOST] -U [USER] -d [DB_NAME]",
      "createdb [DB_NAME]",
      "dropdb [DB_NAME]",
      "pg_dump -h [HOST] -U [USER] -d [DB_NAME] > [OUTPUT_FILE]",
      "pg_restore -h [HOST] -U [USER] -d [DB_NAME] [DUMP_FILE]",
      "psql -h [HOST] -U [USER] -d [DB_NAME] -c \"SELECT now();\"",
      "psql -h [HOST] -U [USER] -d [DB_NAME] -c \"\\dt\"",
      "psql -h [HOST] -U [USER] -d [DB_NAME] -c \"\\d [TABLE_NAME]\"",
      "psql -h [HOST] -U [USER] -d [DB_NAME] -c \"EXPLAIN ANALYZE [QUERY]\"",
      "psql -h [HOST] -U [USER] -d [DB_NAME] -c \"VACUUM ANALYZE;\"",
      "psql -h [HOST] -U [USER] -d [DB_NAME] -c \"SELECT * FROM [TABLE_NAME] LIMIT 50;\"",
      "psql -h [HOST] -U [USER] -d [DB_NAME] -c \"CREATE EXTENSION IF NOT EXISTS pgcrypto;\"",
      "psql -h [HOST] -U [USER] -d [DB_NAME] -c \"\\l\"",
      "psql -h [HOST] -U [USER] -d [DB_NAME] -c \"\\du\"",
      "psql -h [HOST] -U [USER] -d [DB_NAME] -c \"\\conninfo\"",
      "psql -h [HOST] -U [USER] -d [DB_NAME] -c \"SELECT pg_size_pretty(pg_database_size('[DB_NAME]'));\"",
      "psql -h [HOST] -U [USER] -d [DB_NAME] -c \"SELECT * FROM pg_stat_activity;\"",
      "psql -h [HOST] -U [USER] -d [DB_NAME] -f [SCRIPT_FILE]",
      "psql -h [HOST] -U [USER] -d [DB_NAME] -c \"\\timing\"",
      "psql -h [HOST] -U [USER] -d [DB_NAME] -c \"\\q\""
    ]
  },
  redis: {
    category: "Database",
    commands: [
      "redis-cli PING",
      "redis-cli SET [KEY] [VALUE]",
      "redis-cli GET [KEY]",
      "redis-cli DEL [KEY]",
      "redis-cli EXISTS [KEY]",
      "redis-cli EXPIRE [KEY] [SECONDS]",
      "redis-cli TTL [KEY]",
      "redis-cli INCR [KEY]",
      "redis-cli HSET [HASH_KEY] [FIELD] [VALUE]",
      "redis-cli HGET [HASH_KEY] [FIELD]",
      "redis-cli LPUSH [LIST_KEY] [VALUE]",
      "redis-cli LRANGE [LIST_KEY] 0 -1",
      "redis-cli SADD [SET_KEY] [VALUE]",
      "redis-cli SMEMBERS [SET_KEY]",
      "redis-cli FLUSHDB",
      "redis-cli MONITOR",
      "redis-cli INFO memory",
      "redis-cli PUBSUB CHANNELS",
      "redis-cli CONFIG GET *",
      "redis-cli DBSIZE"
    ]
  },
  terraform: {
    category: "Infrastructure",
    commands: [
      "terraform init",
      "terraform fmt -recursive",
      "terraform validate",
      "terraform plan",
      "terraform apply",
      "terraform apply -auto-approve",
      "terraform destroy",
      "terraform destroy -auto-approve",
      "terraform workspace list",
      "terraform workspace select [WORKSPACE_NAME]",
      "terraform workspace new [WORKSPACE_NAME]",
      "terraform state list",
      "terraform output",
      "terraform output -json",
      "terraform providers",
      "terraform graph",
      "terraform taint [RESOURCE_ADDRESS]",
      "terraform import [RESOURCE_ADDRESS] [RESOURCE_ID]",
      "terraform show",
      "terraform force-unlock [LOCK_ID]"
    ]
  },
  github: {
    category: "Collaboration",
    commands: [
      "gh auth login",
      "gh repo view",
      "gh repo clone [REPO_NAME]",
      "gh issue list",
      "gh issue view [ISSUE_NUMBER]",
      "gh issue create --title \"[TITLE]\" --body \"[BODY]\"",
      "gh pr list",
      "gh pr view [PR_NUMBER]",
      "gh pr checkout [PR_NUMBER]",
      "gh pr create --title \"[TITLE]\" --body \"[BODY]\"",
      "gh pr merge [PR_NUMBER]",
      "gh pr checks [PR_NUMBER]",
      "gh run list",
      "gh run view [RUN_ID]",
      "gh workflow list",
      "gh workflow run [WORKFLOW_FILE]",
      "gh release list",
      "gh release create [TAG_NAME] --title \"[TITLE]\" --notes \"[NOTES]\"",
      "gh api repos/[OWNER]/[REPO]/pulls/[PR_NUMBER]/comments",
      "gh status"
    ]
  },
  firebase: {
    category: "Backend",
    commands: [
      "firebase login",
      "firebase init",
      "firebase deploy",
      "firebase deploy --only hosting",
      "firebase deploy --only functions",
      "firebase emulators:start",
      "firebase emulators:exec \"[COMMAND]\"",
      "firebase functions:log",
      "firebase hosting:channel:deploy [CHANNEL_NAME]",
      "firebase target:apply hosting [TARGET_NAME] [SITE_ID]",
      "firebase use [PROJECT_ID]",
      "firebase projects:list",
      "firebase firestore:indexes",
      "firebase firestore:delete [PATH]",
      "firebase database:get [PATH]",
      "firebase database:set [PATH] [DATA]",
      "firebase apps:list",
      "firebase functions:shell",
      "firebase ext:list",
      "firebase deploy --except functions"
    ]
  },
  vercel: {
    category: "Cloud",
    commands: [
      "vercel login",
      "vercel",
      "vercel --prod",
      "vercel pull --yes --environment=preview",
      "vercel pull --yes --environment=production",
      "vercel env ls",
      "vercel env add [KEY] production",
      "vercel env pull .env.local",
      "vercel domains ls",
      "vercel domains add [DOMAIN]",
      "vercel projects ls",
      "vercel rollback [DEPLOYMENT_URL]",
      "vercel logs [DEPLOYMENT_URL]",
      "vercel alias ls",
      "vercel alias set [DEPLOYMENT_URL] [DOMAIN]",
      "vercel inspect [DEPLOYMENT_URL]",
      "vercel whoami",
      "vercel teams ls",
      "vercel redeploy [DEPLOYMENT_URL]",
      "vercel certs ls"
    ]
  }
};

function toTitle(command) {
  const clean = command.replace(/\[[A-Z0-9_]+\]/g, "").trim();
  const words = clean.split(/\s+/).slice(0, 6);
  return words
    .join(" ")
    .replace(/^./, (char) => char.toUpperCase())
    .replace(/["']/g, "");
}

function extractPlaceholders(command) {
  const placeholders = command.match(/\[[A-Z0-9_]+\]/g) ?? [];
  const unique = [...new Set(placeholders)];
  return unique.map((placeholder) => {
    const key = placeholder.replace(/\[|\]/g, "");
    const label = key
      .split("_")
      .map((part) => part[0] + part.slice(1).toLowerCase())
      .join(" ");
    return {
      placeholder,
      label,
      description: `Value for ${label.toLowerCase()}`,
      required: true
    };
  });
}

function extractFlags(command) {
  const tokens = command.split(/\s+/).filter(Boolean);
  const flags = tokens.filter((token) => token.startsWith("-"));
  const unique = [...new Set(flags)];
  return unique.map((flag) => ({
    flag,
    description: `Flag used by ${command.split(/\s+/)[0]}`
  }));
}

function commandTags(tool, command) {
  const base = command
    .replace(/\[[A-Z0-9_]+\]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .map((part) => part.toLowerCase().replace(/[^a-z0-9:-]/g, ""))
    .filter(Boolean);
  return [...new Set([tool, ...base])].slice(0, 8);
}

function uniqBy(items, keyFn) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(item);
  }
  return result;
}

function validateCommandShape(command) {
  const issues = [];
  const required = ["id", "tool", "category", "title", "description", "command", "difficulty"];
  for (const key of required) {
    if (typeof command[key] !== "string" || command[key].trim().length === 0) {
      issues.push(`invalid ${key}`);
    }
  }

  if (!Array.isArray(command.params)) {
    issues.push("params must be an array");
  } else {
    for (const item of command.params) {
      if (
        !item ||
        typeof item !== "object" ||
        typeof item.placeholder !== "string" ||
        typeof item.label !== "string" ||
        typeof item.description !== "string" ||
        typeof item.required !== "boolean"
      ) {
        issues.push("invalid param entry");
        break;
      }
    }
  }

  if (!Array.isArray(command.flags)) {
    issues.push("flags must be an array");
  } else {
    for (const item of command.flags) {
      if (
        !item ||
        typeof item !== "object" ||
        typeof item.flag !== "string" ||
        typeof item.description !== "string"
      ) {
        issues.push("invalid flag entry");
        break;
      }
    }
  }

  if (!Array.isArray(command.tags) || command.tags.length === 0) {
    issues.push("tags must be a non-empty array");
  } else if (!command.tags.every((tag) => typeof tag === "string" && tag.trim().length > 0)) {
    issues.push("invalid tag entry");
  }

  if (!["beginner", "intermediate", "advanced"].includes(command.difficulty)) {
    issues.push("invalid difficulty");
  }

  return issues;
}

function normalizeAndValidateCommands(tool, commands) {
  const normalized = commands.map((item) => {
    const params = item.params.map((param) => ({
      ...param,
      placeholder: param.placeholder.trim(),
      label: param.label.trim(),
      description: param.description.trim()
    }));
    const flags = uniqBy(
      item.flags.map((flag) => ({
        ...flag,
        flag: flag.flag.trim(),
        description: flag.description.trim()
      })),
      (flag) => flag.flag
    );
    const tags = [...new Set(item.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
    return {
      ...item,
      id: item.id.trim(),
      tool: item.tool.trim(),
      category: item.category.trim(),
      title: item.title.trim(),
      description: item.description.trim(),
      command: item.command.replace(/\s+/g, " ").trim(),
      params,
      flags,
      tags
    };
  });

  const deduped = uniqBy(normalized, (item) => `${item.id}|${item.tool}|${item.command}`);
  const errors = [];
  const ids = new Set();
  for (const command of deduped) {
    if (ids.has(command.id)) {
      errors.push(`duplicate id: ${command.id}`);
    }
    ids.add(command.id);

    const issues = validateCommandShape(command);
    if (issues.length > 0) {
      errors.push(`${command.id}: ${issues.join(", ")}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Data quality checks failed for ${tool}: ${errors.slice(0, 8).join(" | ")}`
    );
  }

  return deduped;
}

function buildForTool(tool, config) {
  const items = [];
  let index = 1;

  for (const seed of config.commands) {
    const baseTitle = toTitle(seed);
    const params = extractPlaceholders(seed);
    const baseFlags = extractFlags(seed);

    for (const context of CONTEXTS) {
      const extra = context.extra[tool] ?? "";
      const command = `${seed}${extra}`.trim();
      items.push({
        id: `${tool}-${String(index).padStart(4, "0")}`,
        tool,
        category: config.category,
        title: `${baseTitle} (${context.titleSuffix})`,
        description: `${baseTitle} command for ${tool} workflows in ${context.titleSuffix.toLowerCase()} mode.`,
        command,
        params: params.map((param) => ({ ...param })),
        flags: [...baseFlags, ...extractFlags(extra)].slice(0, 6),
        tags: commandTags(tool, command),
        difficulty: params.length > 2 ? "intermediate" : "beginner"
      });
      index += 1;
    }
  }

  return items;
}

async function main() {
  await mkdir(DATA_DIR, { recursive: true });

  let total = 0;
  for (const [tool, config] of Object.entries(TOOL_CATALOG)) {
    const commands = normalizeAndValidateCommands(tool, buildForTool(tool, config));
    total += commands.length;
    const filePath = path.join(DATA_DIR, `${tool}.json`);
    await writeFile(filePath, `${JSON.stringify(commands, null, 2)}\n`, "utf8");
  }

  process.stdout.write(
    `Generated ${total} commands across ${Object.keys(TOOL_CATALOG).length} tools.\n`
  );
}

main().catch((error) => {
  process.stderr.write(`${String(error)}\n`);
  process.exit(1);
});
