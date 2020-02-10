import { useState, useEffect } from "react";
import { useCamera } from '@ionic/react-hooks/camera';
import { useFilesystem, base64FromPath } from '@ionic/react-hooks/filesystem';
import { useStorage } from '@ionic/react-hooks/storage';
import { isPlatform } from '@ionic/react';
import { CameraResultType, CameraSource, CameraPhoto, Capacitor, FilesystemDirectory } from "@capacitor/core";
import { save } from "ionicons/icons";

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
      const photos = (photosString ? JSON.parse(photosString) : []) as Photo[];
      for (let photo of photos) {
        const file = await readFile({
          path: photo.filepath,
          directory: FilesystemDirectory.Data
        });
        photo.base64 = `data:image/jpeg;base64,${file.data}`;
      }
      setPhotos(photos);
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
    setPhotos(newPhotos)

    set(PHOTO_STORAGE, JSON.stringify(newPhotos.map(p => {
      // Don't save the base64 representation of the photo data,
      // since it's already saved on the Filesystem
      const photoCopy = { ...p };
      // FIXME: Property 'base64' does not exist on type
      // `photoCopy` is not Photo
      // delete photoCopy.base64;
      return photoCopy;
    })));
  };

  const savePicture = async (photo: CameraPhoto, fileName: string) => {
    const base64Data = await base64FromPath(photo.webPath!);
    await writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });
    return getPhotoFile(photo, fileName);
  };

  const getPhotoFile = async (cameraPhoto: CameraPhoto, fileName: string) => {
    return {
      filepath: fileName,
      webviewPath: cameraPhoto.webPath
    };
  };

  return {
    photos,
    takePhoto
  };
}