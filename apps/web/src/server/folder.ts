import type { Folder } from "@repo/db/schemas/folder.schema";
import type { FolderWithItems } from "@repo/db/validators/folder.validator";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { isAxiosError } from "axios";
import z from "zod";

import { axiosClient, axiosErrMsg } from "@/lib/axios";
import { queryKeys } from "@/lib/query";
import type { ApiSuccessResponse } from "@/lib/types";
import { headersMiddleware } from "@/middleware/headers-middleware";

//* ENSURE ROOT FOLDER
// Ensures the user has a root folder, creating one if it doesn't exist
export const $ensureRootFolder = createServerFn()
  .middleware([headersMiddleware])
  .handler(async ({ context }) => {
    const res = await axiosClient.post<ApiSuccessResponse<Folder>>(
      "/folders/root",
      {},
      {
        headers: context.headers,
      },
    );

    return res.data.data;
  });

//* GET FOLDER
// get folder server fn
export const $getFolder = createServerFn()
  .middleware([headersMiddleware])
  .inputValidator(z.string().min(1).optional())
  .handler(async ({ context, data: folderId }) => {
    try {
      const res = await axiosClient.get<ApiSuccessResponse<FolderWithItems>>(
        "/folders",
        {
          headers: context.headers,
          params: folderId ? { folderId } : undefined,
        },
      );

      return res.data.data;
    } catch (err) {
      if (isAxiosError(err)) {
        console.error("Error getting folder:", axiosErrMsg(err));
      }
      return null;
    }
  });
// get folder query options
export const folderQueryOptions = queryOptions({
  queryKey: queryKeys.folder("root"),
  queryFn: $getFolder,
  // Folder structure doesn't change often, use longer stale time
  staleTime: 2 * 60 * 1000,
  // Keep folder tree in cache for quick access
  gcTime: 30 * 60 * 1000,
});

//* CREATE FOLDER
// create folder server fn
export const $createFolder = createServerFn()
  .middleware([headersMiddleware])
  .inputValidator(
    z.object({
      name: z.string().min(1),
      parentId: z.string().min(1).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const rootFolder = await $getFolder();

    const payload = {
      parentFolderId: data.parentId ?? rootFolder?.id,
      name: data.name,
    };

    const res = await axiosClient.post<ApiSuccessResponse<Folder>>(
      "/folders",
      payload,
      {
        headers: context.headers,
      },
    );

    return res.data;
  });

//* RENAME FOLDER
// rename folder server fn
export const $renameFolder = createServerFn()
  .middleware([headersMiddleware])
  .inputValidator(
    z.object({
      name: z.string().min(1),
      folderId: z.string().min(1),
    }),
  )
  .handler(async ({ context, data }) => {
    const payload = {
      name: data.name,
    };

    const res = await axiosClient.put<ApiSuccessResponse<Folder>>(
      `/folders/${data.folderId}`,
      payload,
      {
        headers: context.headers,
      },
    );

    return res.data;
  });

//* MOVE FOLDER
// move folder server fn
export const $moveFolder = createServerFn({
  method: "POST",
})
  .middleware([headersMiddleware])
  .inputValidator(
    z.object({
      folderId: z.string().min(1),
      parentFolderId: z.string().min(1),
    }),
  )
  .handler(async ({ context, data }) => {
    const payload = {
      parentFolderId: data.parentFolderId,
    };

    const res = await axiosClient.patch<ApiSuccessResponse<Folder>>(
      `/folders/${data.folderId}/move`,
      payload,
      {
        headers: context.headers,
      },
    );

    return res.data;
  });

//* DELETE FOLDER
// delete folder server fn
export const $deleteFolder = createServerFn()
  .middleware([headersMiddleware])
  .inputValidator(
    z.object({
      folderId: z.string().min(1),
    }),
  )
  .handler(async ({ context, data }) => {
    await axiosClient.delete<ApiSuccessResponse<Folder>>(
      `/folders/${data.folderId}`,
      {
        headers: context.headers,
      },
    );
  });
