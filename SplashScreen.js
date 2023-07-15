import React, { useEffect } from 'react';
import { View, Image, Animated } from 'react-native';

const logo = require('./assets/img/logo.png');

const SplashScreen = ({ navigation }) => {
    const opacity = new Animated.Value(0);

    useEffect(() => {
        // Hide the title bar
        navigation.setOptions({
          headerShown: false,
        });

        Animated.timing(opacity, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
        }).start(() => {
            setTimeout(() => {
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }).start(() => navigation.replace('Home'));
            }, 2000);
        });
    }, []);

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.Image
                source={logo}
                style={{
                    opacity,
                    width: '30%',
                    height: undefined,
                    aspectRatio: 1,
                }}
                resizeMode="contain" />
        </View>
    );
};

export default SplashScreen;