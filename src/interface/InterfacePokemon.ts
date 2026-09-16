export default interface Pokemon {
    pokemon_name: string;
    pokemon_image: string;
    pokemon_id?: number;
    types?: PokemonType;
    description?: string;
    height?: number;
    weight?: number;
    stats?: PokemonStat[];
    abilities?: PokemonAbility[];
}

export interface PokemonType {
    type1: string;
    type2?: string;
}

export interface PokemonStat {
    base_stat: number;
    stat: {
        name: string;
    };
}

export interface PokemonAbility {
    ability: {
        name: string;
    };
}