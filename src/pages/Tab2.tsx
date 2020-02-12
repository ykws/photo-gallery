import React, { useState } from 'react';
import { camera, trash, close } from 'ionicons/icons';
import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar, IonFab, IonFabButton, IonIcon, IonGrid, IonRow, IonCol, IonImg, IonActionSheet } from '@ionic/react';
import { usePhotoGallery, Photo } from '../hooks/usePhotoGallery';

const Tab2: React.FC = () => {
  const { photos, takePhoto, deletePhoto } = usePhotoGallery();

  const [photoToDelete, setPhotoToDelete] = useState<Photo>();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Photo Gallery</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            {photos.map((photo, index) => (
              <IonCol size="6" key={index}>
                <IonImg onClick={() => setPhotoToDelete(photo)}
                        src={photo.base64 ?? photo.webviewPath} />
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={() => takePhoto()}>
            <IonIcon icon={camera}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
      <IonActionSheet
        isOpen={!!photoToDelete}
        buttons={[{
          text: 'Delete',
          role: 'destructive',
          icon: trash,
          handler: () => {
            if (photoToDelete) {
              deletePhoto(photoToDelete);
              setPhotoToDelete(undefined);
            }
          }
        }, {
          text: 'Cancel',
          role: 'cancel',
          icon: close,
        }]}
        onDidDismiss={() => setPhotoToDelete(undefined)}
      />
    </IonPage>
  );
};

export default Tab2;