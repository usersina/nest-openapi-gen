import { ClassDeclaration, MethodDeclaration, Project, StringLiteral, Type } from "ts-morph";

export const isPrimitive = (type: Type) => type.isBoolean() || type.isNumber() || type.isString();

export function getControllers(tsConfigFilePath = process.cwd() + "/tsconfig.json") {
  const project = new Project({ tsConfigFilePath });
  const sourceFiles = project.getSourceFiles();
  const controllers: ClassDeclaration[] = [];
  sourceFiles.forEach((s) => {
    s.getClasses().forEach((c) => {
      if (c.getName()?.endsWith("Controller")) controllers.push(c);
    });
  });
  return controllers;
}

export function getMethodDetails(method: MethodDeclaration) {
  const validRequestTypes = ["Post", "Get", "Delete", "Put", "Patch", "Options", "Head"];
  const methodTypeDecorator = method.getDecorators().find((decorator) => validRequestTypes.includes(decorator.getName()));
  if (!methodTypeDecorator) return;

  const path = (methodTypeDecorator.getArguments()[0] as StringLiteral)?.getLiteralValue() || "";
  const httpMethodType = methodTypeDecorator.getName().toLowerCase();
  const description = method
    .getJsDocs()
    .map((doc) => doc.getInnerText())
    .join("\n");

  const responseType = method.getReturnType();
  const parameters = method.getParameters();
  return { path, httpMethodType, description, responseType, parameters };
}
