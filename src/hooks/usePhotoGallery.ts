import { useState, useEffect } from "react";
import { useCamera } from '@ionic/react-hooks/camera';
import { useFilesystem, base64FromPath } from '@ionic/react-hooks/filesystem';
import { useStorage } from '@ionic/react-hooks/storage';
import { isPlatform } from '@ionic/react';
import { CameraResultType, CameraSource, CameraPhoto, Capacitor, FilesystemDirectory } from "@capacitor/core";

const PHOTO_STORAGE = "photos";

export interface Photo {
  filepath: string;
  webviewPath?: string;
  base64?: string;
}

export function usePhotoGallery() {

  const { deleteFile, getUri, readFile, writeFile } = useFilesystem();

  const { get, set } = useStorage();

  const { getPhoto } = useCamera();

  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    const loadSaved = async () => {
      const photosString = await get('photos');
      const photosInStorage = (photosString ? JSON.parse(photosString) : []) as Photo[];
      if (!isPlatform('hybrid')) {
        for (let photo of photosInStorage) {
          const file = await readFile({
            path: photo.filepath,
            directory: FilesystemDirectory.Data
          });
          photo.base64 = `data:image/jpeg;base64,${file.data}`;
        }
      }
      setPhotos(photosInStorage);
    };
    loadSaved();
  }, [get, readFile]);

  const takePhoto = async () => {
    const cameraPhoto = await getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    const fileName = new Date().getTime() + '.jpg';
    const saveFileImage = await savePicture(cameraPhoto, fileName);
    const newPhotos = [saveFileImage, ...photos];
    // FIXME: Argument of type ... is not assignable to parameter of type 'SetStateAction<Photo[]>'.
    // `newPhotos` is not Photo[]
    // setPhotos(newPhotos)

    set(PHOTO_STORAGE, 
      isPlatform('hybrid')
        ? JSON.stringify(newPhotos)
        : JSON.stringify(newPhotos.map(p => {
          // Don't save the base64 representation of the photo data,
          // since it's already saved on the Filesystem
          const photoCopy = { ...p };
          // FIXME: Property 'base64' does not exist on type
          // `photoCopy` is not Photo
          // delete photoCopy.base64;
          return photoCopy;
        }))
    );
  };

  const savePicture = async (photo: CameraPhoto, fileName: string) => {
    let base64Data: string;
    if (isPlatform('hybrid')) {
      const file = await readFile({
        path: photo.path!
      });
      base64Data = file.data;
    } else {
      base64Data = await base64FromPath(photo.webPath!);
    }
    await writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });
    return getPhotoFile(photo, fileName);
  };

  const getPhotoFile = async (cameraPhoto: CameraPhoto, fileName: string) => {
    if (isPlatform('hybrid')) {
      const fileUri = await getUri({
        directory: FilesystemDirectory.Data,
        path: fileName
      });

      return {
        filePath: fileUri.uri,
        webviewPath: Capacitor.convertFileSrc(fileUri.uri)
      };
    }
    else {
      return {
        filepath: fileName,
        webviewPath: cameraPhoto.webPath
      };
    }
  };

  return {
    photos,
    takePhoto
  };
}