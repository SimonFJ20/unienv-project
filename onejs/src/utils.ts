

export const getTokenPosition = ({offset, lineBreaks, line, col}: any) => ({offset, lineBreaks, line, col});


export type MatchPrimitivePair<T, R> = [T | T[], () => R];

export const matchPrimitive = <T, R, D = null>(
    value: T, defVal: D, pairs: MatchPrimitivePair<T, R>[]
): R | D => {
    for (const pair of pairs)
        if (Array.isArray(pair[0]))
            for (const p of pair[0])
                if (value === p)
                    return pair[1]();
                else {}
        else
            if (value === pair[0])
                return pair[1]();
    return defVal;
}

export const matchPredicate = <T, R, D = null>(
    predicate: (v: T) => boolean, defVal: D, pairs: MatchPrimitivePair<T, R>[]
):  R | D => {
    for (const pair of pairs)
        if (Array.isArray(pair[0]))
            for (const p of pair[0])
                if (predicate(p))
                    return pair[1]();
        else
            if (predicate(p))
                return pair[1]();
    return defVal;
}
