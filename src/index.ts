import { writeFileSync } from "fs";
import { cloneDeep, findIndex, orderBy } from "lodash";
import { OpenAPIV3 } from "openapi-types";
import { Type } from "ts-morph";
import { getControllerPath, getControllerTag } from "./utils/controller";
import { omitDeepBy } from "./utils/omit-by";
import { definitions, getMethodParameters, getResponseObject } from "./utils/openapi";
import { getPackageInfo } from "./utils/package";
import { getControllers, getMethodDetails } from "./utils/typescript";
import { getOpenapiPath } from "./utils/util";

function setMethodSchema(
  schema: OpenAPIV3.Document,
  path: string,
  httpMethodType: string,
  responseType: Type,
  description: string,
  tag,
  methodParameterSchemas
) {
  schema.paths[path] = schema.paths[path] || {};
  schema.paths[path]![httpMethodType] = {
    tags: [tag.name],
    responses: { 200: getResponseObject(responseType) },
    description: description,
    ...cloneDeep(methodParameterSchemas),
  };
}

export function generate(options?: { prefix?: string; filePath?: string; tsConfigFilePath?: string }) {
  const schema: OpenAPIV3.Document = {
    openapi: "3.0.0",
    info: getPackageInfo(),
    paths: {},
    components: {},
    tags: [],
  };
  getControllers(options?.tsConfigFilePath).forEach((controller) => {
    const tag = getControllerTag(controller);
    schema.tags?.push(tag);
    const basePath = getControllerPath(controller, options?.prefix);
    controller.getMethods().forEach((method) => {
      const methodDetails = getMethodDetails(method);
      if (!methodDetails) return;
      const methodParameterSchemas = getMethodParameters(methodDetails.parameters);
      const path = getOpenapiPath(basePath, methodDetails.path);
      const optionalParams: OpenAPIV3.ParameterObject[] = orderBy(
        methodParameterSchemas.parameters.filter((p) => p.in === "path" && !p.required),
        (p) => findIndex(path, p.name)
      );
      if (!optionalParams.length)
        setMethodSchema(
          schema,
          path,
          methodDetails.httpMethodType,
          methodDetails.responseType,
          methodDetails.description,
          tag,
          methodParameterSchemas
        );
      else {
        methodParameterSchemas.parameters = methodParameterSchemas.parameters.filter((p) => p.in !== "path" || p.required);
        optionalParams.forEach((optionalParam) => {
          const partialPath = path.split("/{" + optionalParam.name)[0];
          if (!schema.paths[partialPath])
            setMethodSchema(
              schema,
              partialPath,
              methodDetails.httpMethodType,
              methodDetails.responseType,
              methodDetails.description,
              tag,
              methodParameterSchemas
            );
          optionalParam.required = true;
          methodParameterSchemas.parameters.push(optionalParam);
          setMethodSchema(
            schema,
            partialPath + "/{" + optionalParam.name + "}",
            methodDetails.httpMethodType,
            methodDetails.responseType,
            methodDetails.description,
            tag,
            methodParameterSchemas
          );
        });
      }
    });
  });
  schema.components!["schemas"] = definitions;
  const swaggerSchema = omitDeepBy(cloneDeep(schema), (x: any, y: any) => {
    return y === "optional";
  });
  writeFileSync(options?.filePath || "./openapi.schema.json", JSON.stringify(swaggerSchema));
}
