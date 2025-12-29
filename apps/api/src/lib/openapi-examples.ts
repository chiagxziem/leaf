export const authExamples = {
  emailValErr: {
    email: "Invalid email address",
  },
  uuidValErr: {
    id: "Invalid UUID",
  },
  jwtValErr: {
    token: "Invalid JWT",
  },
};

export const notesExamples = {
  createNoteValErrs: {
    title: "Too small: expected string to have >=1 characters",
    folderId: "Invalid UUID",
    isFavorite: "Invalid input: expected boolean, received string",
    tags: "Invalid input: expected array, received string",
  },
  favoriteNoteValErrs: {
    favorite: "Invalid input: expected boolean, received string",
  },
};

export const foldersExamples = {
  createRootFolderValErrs: {
    name: "Too small: expected string to have >=1 characters",
    parentFolderId: "Invalid UUID",
    isRoot: "Invalid input: expected boolean, received string",
  },
  createFolderValErrs: {
    name: "Too small: expected string to have >=1 characters",
    parentFolderId: "Invalid UUID",
  },
};

export const userExamples = {
  updateUserValErrs: {
    name: "Too small: expected string to have >=1 characters",
  },
};
