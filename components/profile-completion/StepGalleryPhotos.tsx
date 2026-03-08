import { Fonts } from "@/constants/theme";
import * as ImagePicker from "expo-image-picker";
import { ImageIcon, Pencil } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_GAP = 10;
const CAROUSEL_WIDTH = SCREEN_WIDTH - 30;

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE_MB = 5;

interface StepGalleryPhotosProps {
  photos: ImagePicker.ImagePickerAsset[];
  onUpdate: (photos: ImagePicker.ImagePickerAsset[]) => void;
  role?: 'PUBLIC' | 'ARTIST';
  existingPhotoUrl?: string | null;
}

export function StepGalleryPhotos({
  photos,
  onUpdate,
  role = 'ARTIST',
  existingPhotoUrl,
}: StepGalleryPhotosProps) {
  const isPublic = role === 'PUBLIC';
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const pickImage = async () => {
    const maxPhotos = isPublic ? 1 : MAX_PHOTOS;
    if (!isPublic && photos.length >= maxPhotos) {
      Alert.alert("Limite atteinte", `Vous pouvez ajouter ${maxPhotos} photos maximum.`);
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission requise",
        "L'accès aux photos est nécessaire."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: !isPublic,
      selectionLimit: isPublic ? 1 : maxPhotos - photos.length,
      allowsEditing: isPublic,
      aspect: isPublic ? [1, 1] : undefined,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      if (isPublic) {
        onUpdate([result.assets[0]]);
      } else {
        const newPhotos = [...photos, ...result.assets].slice(0, maxPhotos);
        onUpdate(newPhotos);
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: newPhotos.length - 1,
            animated: true,
          });
        }, 100);
      }
    }
  };

  const replacePhoto = async (index: number) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const updated = [...photos];
      updated[index] = result.assets[0];
      onUpdate(updated);
    }
  };

  const renderCarouselItem = ({
    item,
    index,
  }: {
    item: ImagePicker.ImagePickerAsset;
    index: number;
  }) => (
    <View style={styles.carouselItemWrapper}>
      <View style={styles.carouselItem}>
        <Image source={{ uri: item.uri }} style={styles.carouselImage} />
      </View>
      <Pressable
        onPress={() => replacePhoto(index)}
        style={styles.pencilButton}
      >
        <Pencil size={24} color="#161616" />
      </Pressable>
    </View>
  );

  const renderEmptyCarousel = () => (
    <View style={styles.emptyCarousel}>
      <ImageIcon size={48} color="#666" />
      <Text style={styles.emptyText}>Aucune photo ajoutée</Text>
    </View>
  );

  if (isPublic) {
    const profilePhoto = photos[0] ?? null;
    const displayUri = profilePhoto?.uri ?? existingPhotoUrl ?? null;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Photo de profil</Text>

        {/* Profile photo preview */}
        <Pressable onPress={pickImage} style={styles.profilePhotoWrapper}>
          {displayUri ? (
            <>
              <Image source={{ uri: displayUri }} style={styles.profilePhoto} />
              <View style={styles.profileEditBadge}>
                <Pencil size={16} color="#161616" />
              </View>
            </>
          ) : (
            <View style={styles.profilePhotoEmpty}>
              <ImageIcon size={48} color="#666" />
              <Text style={styles.emptyText}>Aucune photo</Text>
            </View>
          )}
        </Pressable>

        {/* Upload button */}
        <Pressable onPress={pickImage} style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>
            {displayUri ? "Changer la photo" : "Cliquez pour upload"}
          </Text>
        </Pressable>

        {/* Helper text */}
        <View style={styles.helperContainer}>
          <Text style={styles.helperText}>
            Le fichier ne doit pas dépasser {MAX_FILE_SIZE_MB} mo
          </Text>
          <Text style={styles.helperText}>Fichier PNG ou JPG.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter d'autres photos</Text>

      {/* Carousel */}
      {photos.length > 0 ? (
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={photos}
            renderItem={renderCarouselItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            keyExtractor={(_, index) => index.toString()}
            snapToInterval={CAROUSEL_WIDTH}
            decelerationRate="fast"
          />
          {/* Pagination dots */}
          <View style={styles.pagination}>
            {Array.from({ length: MAX_PHOTOS }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === activeIndex && index < photos.length
                    ? styles.dotActive
                    : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        </View>
      ) : (
        renderEmptyCarousel()
      )}

      {/* Upload button */}
      <Pressable onPress={pickImage} style={styles.uploadButton}>
        <Text style={styles.uploadButtonText}>
          {photos.length > 0 ? "Ajouter une photo" : "Cliquez pour upload"}
        </Text>
      </Pressable>

      {/* Helper text */}
      <View style={styles.helperContainer}>
        <Text style={styles.helperText}>
          Le fichier ne doit pas dépasser {MAX_FILE_SIZE_MB} mo
        </Text>
        <Text style={styles.helperText}>Fichier PNG ou JPG.</Text>
      </View>

      {/* Counter */}
      <Text style={styles.counterText}>
        {photos.length}/{MAX_PHOTOS} photos
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 17,
    fontFamily: Fonts.extraBold,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.34,
  },

  // Carousel
  carouselContainer: {
    width: CAROUSEL_WIDTH,
    alignItems: "center",
    gap: 8,
  },
  carouselItemWrapper: {
    width: CAROUSEL_WIDTH,
    paddingRight: ITEM_GAP,
    paddingBottom: 25,
    position: "relative",
  },
  carouselItem: {
    width: CAROUSEL_WIDTH - ITEM_GAP,
    height: 250,
    borderRadius: 10,
    overflow: "hidden",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  pencilButton: {
    position: "absolute",
    bottom: 12,
    right: ITEM_GAP - 10,
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#F9F871",
    justifyContent: "center",
    alignItems: "center",
  },

  // Empty state
  emptyCarousel: {
    width: CAROUSEL_WIDTH,
    height: 250,
    borderRadius: 10,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#666",
  },

  // Pagination
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
  },
  dotInactive: {
    backgroundColor: "#555555",
  },

  // Upload
  uploadButton: {
    width: 331,
    height: 44,
    borderWidth: 1,
    borderColor: "#a6a6a6",
    borderRadius: 43,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButtonText: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: "#b6b6b6",
    textAlign: "center",
  },

  // Helper
  helperContainer: {
    alignItems: "center",
  },
  helperText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "#b6b6b6",
    textAlign: "center",
  },

  // Counter
  counterText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: "rgba(255, 255, 255, 0.5)",
  },

  // Profile photo (PUBLIC mode)
  profilePhotoWrapper: {
    width: 150,
    height: 150,
    borderRadius: 75,
    position: "relative",
  },
  profilePhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    resizeMode: "cover",
  },
  profilePhotoEmpty: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  profileEditBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FC5F67",
    justifyContent: "center",
    alignItems: "center",
  },
});
