import { GliderData, GlidersDataIndex } from '../App';

interface Option {
    value: string;
    label: string;
    children?: Option[];
    disabled?: boolean;
}

export function transformDataToOptions(data: any): Option[] {
    return Object.values(data).map((manufacturer: any) => ({
        value: manufacturer.name,
        label: manufacturer.name,
        disabled: !manufacturer.gliders,
        children: manufacturer.gliders ? manufacturer.gliders.map((gliderModel: any) => ({
            value: gliderModel.name,
            label: gliderModel.name,
            disabled: !gliderModel.gliders && !gliderModel.polar,
            children: gliderModel.gliders ? gliderModel.gliders.map((variant: any) => ({
                value: variant.name,
                label: variant.name,
                disabled: !variant.gliders && !variant.polar,
                children: variant.gliders ? variant.gliders.map((wingLoad: any) => ({
                    value: wingLoad.name,
                    label: wingLoad.name,
                    disabled: !wingLoad.gliders && !wingLoad.polar,
                })) : undefined
            })) : undefined
        })) : undefined
    }));
}

export function transformDataToStatsOptions(data: any): Option[] {
    return Object.values(data).map((manufacturer: any) => ({
        value: manufacturer.name,
        label: manufacturer.name,
        children: manufacturer.gliders ? manufacturer.gliders.map((gliderModel: any) => ({
            value: gliderModel.name,
            label: gliderModel.name,
            children: !gliderModel.isGlider && gliderModel.gliders ? gliderModel.gliders.map((variant: any) => ({
                value: variant.name,
                label: variant.name,
                children: !variant.isGlider && variant.gliders ? variant.gliders.map((wingLoad: any) => ({
                    value: wingLoad.name,
                    label: wingLoad.name,
                })) : undefined
            })) : undefined
        })) : undefined
    }));
}

interface YearlyValues {
    year: number;
    [key: string]: number;
}

export const loadGlidersDataForPolarChart = (glidersData: GlidersDataIndex, ...gliders: string[]) => {
    let speedsMap = initializeSpeedsMap(gliders);

    for (let manufacturerName in glidersData) {
        const manufacturer = glidersData[manufacturerName] as GliderData;
        processGlider(manufacturer, gliders, speedsMap);
    }

    return Object.values(speedsMap).sort((a: any, b: any) => a.speed - b.speed);
}

export const loadGlidersDataForStatsChart = (glidersData: GlidersDataIndex, ...gliders: string[]) => {
    var participation: YearlyValues[] = [{ "year": 1999 }, { "year": 2000 }, { "year": 2001 }, { "year": 2002 }, { "year": 2003 }, { "year": 2004 }, { "year": 2005 }, { "year": 2006 }, { "year": 2007 }, { "year": 2008 }, { "year": 2009 }, { "year": 2010 }, { "year": 2011 }, { "year": 2012 }, { "year": 2013 }, { "year": 2014 }, { "year": 2015 }, { "year": 2016 }, { "year": 2017 }, { "year": 2018 }, { "year": 2019 }, { "year": 2020 }, { "year": 2021 }, { "year": 2022 }, { "year": 2023 }];
    
    Object.values(glidersData).forEach(manufacturer => {
        manufacturer.gliders?.forEach(glider => {
            if (glider.isGlider && gliders.includes(glider.name)) {
                glider.competitonParticipation?.forEach(year => {
                    const index = participation.findIndex(p => p.year === year.year);
                    if (index !== -1) {
                        participation[index][glider.name] = year.value;
                    }
                })
            } else {
                glider.gliders?.forEach(subGlider => {
                    if (subGlider.isGlider && gliders.includes(subGlider.name)) {
                        subGlider.competitonParticipation?.forEach(year => {
                            const index = participation.findIndex(p => p.year === year.year);
                            if (index !== -1) {
                                participation[index][subGlider.name] = year.value;
                            }
                        })
                    }
                })
            }
        })
    })

    return participation;
}


const processGlider = (glider: GliderData, glidersList: string[], speedsMap: { [speed: number]: any }) => {
    // recursive function to load gliders data tree for cascader
    if (glider.gliders) {
        for (let subGlider of glider.gliders) {
            processGlider(subGlider, glidersList, speedsMap);
        }

        return
    }

    if (glidersList.includes(glider.name) && glider.polar) {
        const polar = glider.polar as [number, number][];
        const interpolatedPolar = interpolateData(polar);

        for (let p of interpolatedPolar) {
            const speed = p[0];
            const value = p[1];
            speedsMap[speed][glider.name] = value;
        }

        return
    }
}

function quadraticInterpolation(x: number, x0: number, x1: number, x2: number, y0: number, y1: number, y2: number): number {
    const term0 = ((x - x1) * (x - x2)) / ((x0 - x1) * (x0 - x2)) * y0;
    const term1 = ((x - x0) * (x - x2)) / ((x1 - x0) * (x1 - x2)) * y1;
    const term2 = ((x - x0) * (x - x1)) / ((x2 - x0) * (x2 - x1)) * y2;
  
    return term0 + term1 + term2;
}

function interpolateData(data: [number, number][]): [number, number][] {
    data.sort((a, b) => a[0] - b[0]);
  
    const interpolatedData: [number, number][] = [];
  
    for (let i = 0; i < data.length - 2; i++) {
        const [x0, y0] = data[i];
        const [x1, y1] = data[i + 1];
        const [x2, y2] = data[i + 2];
  
        for (let x = x0; x <= x2; x++) {
            const y = quadraticInterpolation(x, x0, x1, x2, y0, y1, y2);
            interpolatedData.push([x, y]);
        }
    }
  
    return interpolatedData;
}


const initializeSpeedsMap = (gliders: string[]) => {
    let speedsMap: { [speed: number]: any } = {};

    for (let speed = 40; speed <= 280; speed++) {
        speedsMap[speed] = { speed: speed };
        for (let glider of gliders) {
            speedsMap[speed][glider] = undefined;
        }
    }
    return speedsMap;
}
