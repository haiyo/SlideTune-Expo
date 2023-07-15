import React, { useState, useEffect, useLayoutEffect, useRef  } from 'react';
import { StyleSheet, View, ScrollView, Image, Animated, Dimensions, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const SlideShowScreen = ({ route }) => {
    const { albumId } = route.params;
    const [photos, setPhotos] = useState([]);
    const navigation = useNavigation();

    useLayoutEffect(() => {
        // Hide the title bar
        navigation.setOptions({
          headerShown: false,
        });

        // Show the slideshow in full-screen mode
        StatusBar.setHidden(true);

        return () => {
            StatusBar.setHidden(false);
        };
    }, []);

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const storedPhotos = await AsyncStorage.getItem(albumId);

                if (storedPhotos !== null) {
                    setPhotos(JSON.parse(storedPhotos));
                }
            }
            catch (e) {
                console.error('Failed to load photos from storage', e);
            }
        };
        fetchPhotos();
    }, [albumId]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const opacity = useRef(new Animated.Value(0)).current;

    const fadeIn = () => {
        Animated.timing(opacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    };

    const fadeOut = () => {
        Animated.timing(opacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
        }).start(() => {
            setCurrentIndex((currentIndex + 1) % photos.length);
        });
    };

    useEffect(() => {
      const intervalId = setInterval(() => {
        fadeOut();
      }, 5000 + 1000); // add 1s to the duration of fadeOut

      fadeIn(); // initially fade in the first photo

      return () => clearInterval(intervalId);
    }, [currentIndex, photos]);

    return (
        <View style={styles.container}>
            <ScrollView horizontal={true}>
                {photos.map((photo, index) => (
                    <Animated.Image
                        key={index}
                        source={{ uri: photo.uri }}
                        style={[
                            styles.image,
                            {
                                opacity: opacity,
                                display: index === currentIndex ? 'flex' : 'none',
                            },
                        ]}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    image: {
        width,
        height,
        resizeMode: 'cover',
        position: 'relative'
    },
});

export default SlideShowScreen;