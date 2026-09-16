import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Keyboard,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Pokemon from "../interface/InterfacePokemon";
import PokemonRequests from "../services/PokemonRequests";

const TYPE_COLORS: Record<string, string> = {
    normal: "#A8A77A",
    fire: "#EE8130",
    water: "#6390F0",
    electric: "#F7D02C",
    grass: "#7AC74C",
    ice: "#96D9D6",
    fighting: "#C22E28",
    poison: "#A33EA1",
    ground: "#E2BF65",
    flying: "#A98FF3",
    psychic: "#F95587",
    bug: "#A6B91A",
    rock: "#B6A136",
    ghost: "#735797",
    dragon: "#6F35FC",
    dark: "#705746",
    steel: "#B7B7CE",
    fairy: "#D685AD",
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function PokemonSearch() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [pokemon, setPokemon] = useState<Pokemon | null>(null);

    // Animations
    const cardOpacity = useRef(new Animated.Value(0)).current;
    const cardTranslateY = useRef(new Animated.Value(40)).current;
    const errorOpacity = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Pokeball pulse animation for loading
    useEffect(() => {
        if (loading) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.15,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [loading]);

    const animateCardIn = () => {
        cardOpacity.setValue(0);
        cardTranslateY.setValue(40);
        Animated.parallel([
            Animated.timing(cardOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(cardTranslateY, {
                toValue: 0,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const animateErrorIn = () => {
        errorOpacity.setValue(0);
        Animated.timing(errorOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setErrorMsg("");
        setPokemon(null);
        Keyboard.dismiss();

        try {
            const result = await PokemonRequests.fetchPokemonData(searchQuery);

            if (result) {
                setPokemon(result);
                setSearchQuery("");
                animateCardIn();
            } else {
                setErrorMsg("Pokémon não encontrado. Verifique o nome ou número.");
                animateErrorIn();
            }
        } catch (error) {
            setErrorMsg("Não foi possível obter os dados do Pokémon.");
            animateErrorIn();
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getPrimaryTypeColor = (): string => {
        if (pokemon?.types) {
            return TYPE_COLORS[pokemon.types.type1] || "#68a0f0";
        }
        return "#68a0f0";
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.pokeballIcon}>◓</Text>
                    <Text style={styles.title}>PokéSearch</Text>
                    <Text style={styles.subtitle}>
                        Busque um Pokémon pelo nome ou número
                    </Text>
                </View>

                {/* Search Section */}
                <View style={styles.searchContainer}>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: pikachu ou 25"
                            placeholderTextColor="#6b7280"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoCapitalize="none"
                            autoCorrect={false}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.searchButton, loading && styles.searchButtonDisabled]}
                        onPress={handleSearch}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                                <ActivityIndicator color="#fff" size="small" />
                            </Animated.View>
                        ) : (
                            <Text style={styles.searchButtonText}>Buscar</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Error Message */}
                {errorMsg ? (
                    <Animated.View style={[styles.errorContainer, { opacity: errorOpacity }]}>
                        <Text style={styles.errorIcon}>⚠️</Text>
                        <Text style={styles.errorText}>{errorMsg}</Text>
                    </Animated.View>
                ) : null}

                {/* Pokemon Card */}
                {pokemon ? (
                    <Pressable
                        onPress={() => {
                            if (pokemon.pokemon_id) {
                                router.push(`/pokemon/${pokemon.pokemon_id}` as any);
                            }
                        }}
                    >
                        <Animated.View
                            style={[
                                styles.card,
                                {
                                    opacity: cardOpacity,
                                    transform: [{ translateY: cardTranslateY }],
                                    borderTopColor: getPrimaryTypeColor(),
                                },
                            ]}
                        >
                        {/* Card Header */}
                        <View
                            style={[
                                styles.cardHeader,
                                { backgroundColor: getPrimaryTypeColor() },
                            ]}
                        >
                            <Text style={styles.cardHeaderLabel}>POKÉMON ENCONTRADO!</Text>
                            <Text style={styles.pokemonNumber}>
                                #{String(pokemon.pokemon_id).padStart(3, "0")}
                            </Text>
                        </View>

                        {/* Pokemon Image */}
                        <View style={styles.imageContainer}>
                            <View
                                style={[
                                    styles.imageBackground,
                                    { backgroundColor: getPrimaryTypeColor() + "18" },
                                ]}
                            >
                                <Image
                                    source={{ uri: pokemon.pokemon_image }}
                                    style={styles.pokemonImage}
                                    contentFit="contain"
                                    transition={300}
                                />
                            </View>
                        </View>

                        {/* Pokemon Name */}
                        <Text style={styles.pokemonName}>
                            {pokemon.pokemon_name.charAt(0).toUpperCase() +
                                pokemon.pokemon_name.slice(1)}
                        </Text>

                        {/* Types */}
                        <View style={styles.typesContainer}>
                            {[pokemon.types?.type1, pokemon.types?.type2]
                                .filter((type): type is string => Boolean(type))
                                .map((type) => (
                                <View
                                    key={type}
                                    style={[
                                        styles.typeBadge,
                                        { backgroundColor: TYPE_COLORS[type] || "#777" },
                                    ]}
                                >
                                    <Text style={styles.typeText}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Text>
                                </View>
                                ))}
                        </View>

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Info Section */}
                        <View style={styles.infoSection}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>ID</Text>
                                <Text style={styles.infoValue}>{pokemon.pokemon_id}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Nome</Text>
                                <Text style={styles.infoValue}>{pokemon.pokemon_name}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Tipagem</Text>
                                <Text style={styles.infoValue}>
                                    {[pokemon.types?.type1, pokemon.types?.type2]
                                        .filter(Boolean)
                                        .join(", ")}
                                </Text>
                            </View>
                        </View>

                        {/* Description */}
                        {pokemon.description ? (
                            <View style={styles.descriptionContainer}>
                                <Text style={styles.descriptionLabel}>📖 Descrição</Text>
                                <Text style={styles.descriptionText}>
                                    {pokemon.description}
                                </Text>
                            </View>
                        ) : null}
                        </Animated.View>
                    </Pressable>
                ) : null}

                {/* Empty State */}
                {!pokemon && !errorMsg && !loading ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateIcon}>🎮</Text>
                        <Text style={styles.emptyStateTitle}>Nenhum Pokémon buscado</Text>
                        <Text style={styles.emptyStateText}>
                            Digite o nome ou número de um Pokémon acima e toque em &quot;Buscar&quot;
                            para ver suas informações!
                        </Text>
                    </View>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },

    // Header
    header: {
        alignItems: "center",
        paddingTop: 20,
        paddingBottom: 28,
    },
    pokeballIcon: {
        fontSize: 40,
        color: "#ef4444",
        marginBottom: 6,
    },
    title: {
        fontSize: 34,
        fontWeight: "800",
        color: "#f8fafc",
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 15,
        color: "#94a3b8",
        marginTop: 6,
    },

    // Search
    searchContainer: {
        gap: 12,
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1e293b",
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: "#334155",
        paddingHorizontal: 16,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: "#f1f5f9",
        fontSize: 16,
        paddingVertical: 16,
    },
    searchButton: {
        backgroundColor: "#ef4444",
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#ef4444",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    searchButtonDisabled: {
        backgroundColor: "#991b1b",
        shadowOpacity: 0,
    },
    searchButtonText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "700",
        letterSpacing: 0.5,
    },

    // Error
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#451a1a",
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#7f1d1d",
    },
    errorIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    errorText: {
        color: "#fca5a5",
        fontSize: 14,
        flex: 1,
        fontWeight: "500",
    },

    // Card
    card: {
        backgroundColor: "#1e293b",
        borderRadius: 24,
        overflow: "hidden",
        marginBottom: 20,
        borderTopWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    cardHeaderLabel: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "800",
        letterSpacing: 1.5,
    },
    pokemonNumber: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 16,
        fontWeight: "700",
    },

    // Image
    imageContainer: {
        alignItems: "center",
        paddingVertical: 20,
    },
    imageBackground: {
        width: 160,
        height: 160,
        borderRadius: 80,
        alignItems: "center",
        justifyContent: "center",
    },
    pokemonImage: {
        width: 120,
        height: 120,
    },

    // Pokemon Name
    pokemonName: {
        fontSize: 28,
        fontWeight: "800",
        color: "#f8fafc",
        textAlign: "center",
        marginBottom: 12,
    },

    // Types
    typesContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    typeBadge: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    typeText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
        letterSpacing: 0.5,
    },

    // Divider
    divider: {
        height: 1,
        backgroundColor: "#334155",
        marginHorizontal: 20,
    },

    // Info Section
    infoSection: {
        padding: 20,
        gap: 14,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    infoLabel: {
        color: "#94a3b8",
        fontSize: 14,
        fontWeight: "600",
    },
    infoValue: {
        color: "#e2e8f0",
        fontSize: 14,
        fontWeight: "500",
    },

    // Description
    descriptionContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: "#0f172a",
        borderRadius: 16,
        padding: 18,
    },
    descriptionLabel: {
        color: "#f8fafc",
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 10,
    },
    descriptionText: {
        color: "#cbd5e1",
        fontSize: 14,
        lineHeight: 22,
    },

    // Empty State
    emptyState: {
        alignItems: "center",
        paddingVertical: 60,
        paddingHorizontal: 30,
    },
    emptyStateIcon: {
        fontSize: 50,
        marginBottom: 16,
    },
    emptyStateTitle: {
        color: "#64748b",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 8,
    },
    emptyStateText: {
        color: "#475569",
        fontSize: 14,
        textAlign: "center",
        lineHeight: 22,
    },
});
