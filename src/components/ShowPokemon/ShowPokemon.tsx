import { Image } from "expo-image";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Pokemon from "../../interface/InterfacePokemon";

interface ShowPokemonProps {
    pokemon: Pokemon;
}

const TYPE_COLORS: Record<string, string> = {
    normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", electric: "#F7D02C",
    grass: "#7AC74C", ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1",
    ground: "#E2BF65", flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
    rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC", dark: "#705746",
    steel: "#B7B7CE", fairy: "#D685AD",
};

export default function ShowPokemon({ pokemon }: ShowPokemonProps) {
    const getStat = (name: string) =>
        pokemon.stats?.find((stat) => stat.stat.name === name)?.base_stat ?? "-";

    const name = pokemon.pokemon_name
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    const types = [pokemon.types?.type1, pokemon.types?.type2].filter(Boolean) as string[];

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.id}>Pokédex #{pokemon.pokemon_id}</Text>
            <Image source={{ uri: pokemon.pokemon_image }} style={styles.image} contentFit="contain" />

            <View style={styles.types}>
                {types.map((type) => (
                    <View key={type} style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[type] || "#64748b" }]}>
                        <Text style={styles.typeText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.sectionTitle}>Informações</Text>
                <Text style={styles.infoText}>Altura: {pokemon.height !== undefined ? pokemon.height / 10 : "-"} m</Text>
                <Text style={styles.infoText}>Peso: {pokemon.weight !== undefined ? pokemon.weight / 10 : "-"} kg</Text>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.sectionTitle}>Status</Text>
                <Text style={styles.infoText}>HP: {getStat("hp")}</Text>
                <Text style={styles.infoText}>Ataque: {getStat("attack")}</Text>
                <Text style={styles.infoText}>Defesa: {getStat("defense")}</Text>
                <Text style={styles.infoText}>Ataque Especial: {getStat("special-attack")}</Text>
                <Text style={styles.infoText}>Defesa Especial: {getStat("special-defense")}</Text>
                <Text style={styles.infoText}>Velocidade: {getStat("speed")}</Text>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.sectionTitle}>Habilidades</Text>
                {pokemon.abilities?.map((ability) => (
                    <Text key={ability.ability.name} style={styles.infoText}>• {ability.ability.name}</Text>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, alignItems: "center", backgroundColor: "#F7FAFC" },
    name: { fontSize: 30, fontWeight: "bold", marginTop: 10, textAlign: "center", color: "#172033" },
    id: { fontSize: 16, color: "#718096", marginBottom: 10, textAlign: "center" },
    image: { width: 250, height: 250 },
    types: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 20 },
    typeBadge: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
    typeText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
    infoCard: { width: "100%", backgroundColor: "#FFFFFF", padding: 16, borderRadius: 12, marginBottom: 15, alignItems: "center" },
    sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center", color: "#172033" },
    infoText: { fontSize: 16, marginBottom: 5, textAlign: "center", color: "#273449" },
});