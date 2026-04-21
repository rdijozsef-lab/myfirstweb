import { ProjectTechnicalSection, ProjectTechnicalValueType, ProjectWorkflowTemplate } from '@prisma/client';

export type TechnicalFieldOption = {
  value: string;
  label: string;
};

export type TechnicalFieldDefinition = {
  section: ProjectTechnicalSection;
  groupKey: string;
  groupLabel: string;
  groupDescription: string;
  paramKey: string;
  label: string;
  valueType: ProjectTechnicalValueType;
  input: 'text' | 'number' | 'textarea' | 'boolean' | 'select';
  unit?: string;
  placeholder?: string;
  options?: TechnicalFieldOption[];
  relatedWorkflows: ProjectWorkflowTemplate[];
};

export type TechnicalParameterValue = {
  paramKey: string;
  label: string;
  textValue: string | null;
  numberValue: number | null;
  booleanValue: boolean | null;
  unit: string | null;
};

export type WorkflowDocumentRequirement = {
  key: string;
  label: string;
  description: string;
  required: boolean;
};

export type TechnicalCalculationGroup = {
  key: string;
  title: string;
  note: string;
  items: Array<{ label: string; value: string }>;
};

export const technicalSectionLabel: Record<ProjectTechnicalSection, string> = {
  BASICS: 'Alapadatok',
  STRUCTURES: 'Szerkezetek',
  EXTERIOR: 'Kulso szerkezetek',
  INTERIOR: 'Belso munkak',
  MEP: 'Gepeszet es villany',
  SUMMARIES: 'Automatikus szamitasok',
  SUBCONTRACTOR_PREP: 'Alvallalkozoi elokeszites',
};

const yesNoOptions: TechnicalFieldOption[] = [
  { value: 'true', label: 'Igen' },
  { value: 'false', label: 'Nem' },
];

export const technicalFieldDefinitions: TechnicalFieldDefinition[] = [
  {
    section: 'BASICS',
    groupKey: 'project_basics',
    groupLabel: 'Projekt alapadatok',
    groupDescription: 'Az ingatlan es az altalanos projektinditasi adatok.',
    paramKey: 'net_floor_area_m2',
    label: 'Netto alapterulet',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 142',
    relatedWorkflows: ['EARTHWORK', 'MASONRY', 'MECHANICAL', 'ELECTRICAL', 'INTERIOR'],
  },
  {
    section: 'BASICS',
    groupKey: 'project_basics',
    groupLabel: 'Projekt alapadatok',
    groupDescription: 'Az ingatlan es az altalanos projektinditasi adatok.',
    paramKey: 'plot_area_m2',
    label: 'Telek terulete',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 860',
    relatedWorkflows: ['EARTHWORK', 'OTHER'],
  },
  {
    section: 'BASICS',
    groupKey: 'project_basics',
    groupLabel: 'Projekt alapadatok',
    groupDescription: 'Az ingatlan es az altalanos projektinditasi adatok.',
    paramKey: 'level_count',
    label: 'Szintek szama',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 1',
    relatedWorkflows: ['MASONRY', 'MECHANICAL', 'ELECTRICAL', 'INTERIOR'],
  },
  {
    section: 'BASICS',
    groupKey: 'project_basics',
    groupLabel: 'Projekt alapadatok',
    groupDescription: 'Az ingatlan es az altalanos projektinditasi adatok.',
    paramKey: 'room_count',
    label: 'Helyisegek szama',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 8',
    relatedWorkflows: ['MECHANICAL', 'ELECTRICAL', 'INTERIOR'],
  },
  {
    section: 'BASICS',
    groupKey: 'utilities',
    groupLabel: 'Kozmuellatottsag',
    groupDescription: 'A kozmuvek allapota checklistas formaban.',
    paramKey: 'utility_electricity',
    label: 'Villany',
    valueType: 'BOOLEAN',
    input: 'boolean',
    options: yesNoOptions,
    relatedWorkflows: ['ELECTRICAL'],
  },
  {
    section: 'BASICS',
    groupKey: 'utilities',
    groupLabel: 'Kozmuellatottsag',
    groupDescription: 'A kozmuvek allapota checklistas formaban.',
    paramKey: 'utility_water',
    label: 'Viz',
    valueType: 'BOOLEAN',
    input: 'boolean',
    options: yesNoOptions,
    relatedWorkflows: ['MECHANICAL'],
  },
  {
    section: 'BASICS',
    groupKey: 'utilities',
    groupLabel: 'Kozmuellatottsag',
    groupDescription: 'A kozmuvek allapota checklistas formaban.',
    paramKey: 'utility_gas',
    label: 'Gaz',
    valueType: 'BOOLEAN',
    input: 'boolean',
    options: yesNoOptions,
    relatedWorkflows: ['MECHANICAL'],
  },
  {
    section: 'BASICS',
    groupKey: 'utilities',
    groupLabel: 'Kozmuellatottsag',
    groupDescription: 'A kozmuvek allapota checklistas formaban.',
    paramKey: 'utility_sewer',
    label: 'Csatorna',
    valueType: 'BOOLEAN',
    input: 'boolean',
    options: yesNoOptions,
    relatedWorkflows: ['MECHANICAL'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'foundation',
    groupLabel: 'Alapozas es zsaluko',
    groupDescription: 'Az alaptest es a zsaluko mennyisegi szamitasahoz szukseges fo adatok.',
    paramKey: 'foundation_depth_cm',
    label: 'Alapozas melysege',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 90',
    relatedWorkflows: ['EARTHWORK', 'MASONRY'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'foundation',
    groupLabel: 'Alapozas es zsaluko',
    groupDescription: 'Az alaptest es a zsaluko mennyisegi szamitasahoz szukseges fo adatok.',
    paramKey: 'foundation_width_cm',
    label: 'Alapozas szelessege',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 50',
    relatedWorkflows: ['EARTHWORK', 'MASONRY'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'foundation',
    groupLabel: 'Alapozas es zsaluko',
    groupDescription: 'Az alaptest es a zsaluko mennyisegi szamitasahoz szukseges fo adatok.',
    paramKey: 'foundation_corner_count',
    label: 'Sarkok szama',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 12',
    relatedWorkflows: ['EARTHWORK', 'MASONRY'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'foundation',
    groupLabel: 'Alapozas es zsaluko',
    groupDescription: 'Az alaptest es a zsaluko mennyisegi szamitasahoz szukseges fo adatok.',
    paramKey: 'foundation_length_m',
    label: 'Alap hossza',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm',
    placeholder: 'pl. 58',
    relatedWorkflows: ['EARTHWORK', 'MASONRY'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'foundation',
    groupLabel: 'Alapozas es zsaluko',
    groupDescription: 'Az alaptest es a zsaluko mennyisegi szamitasahoz szukseges fo adatok.',
    paramKey: 'zsaluko_row_height_cm',
    label: 'Zsaluko sormagassag',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 20',
    relatedWorkflows: ['EARTHWORK', 'MASONRY'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'foundation',
    groupLabel: 'Alapozas es zsaluko',
    groupDescription: 'Az alaptest es a zsaluko mennyisegi szamitasahoz szukseges fo adatok.',
    paramKey: 'zsaluko_rows_count',
    label: 'Zsaluko sorok szama',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 4',
    relatedWorkflows: ['EARTHWORK', 'MASONRY'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'foundation',
    groupLabel: 'Alapozas es zsaluko',
    groupDescription: 'Az alaptest es a zsaluko mennyisegi szamitasahoz szukseges fo adatok.',
    paramKey: 'fill_soil_depth_cm',
    label: 'Toltofold vastagsag',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 35',
    relatedWorkflows: ['EARTHWORK'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'foundation',
    groupLabel: 'Alapozas es zsaluko',
    groupDescription: 'Az alaptest es a zsaluko mennyisegi szamitasahoz szukseges fo adatok.',
    paramKey: 'gravel_bed_thickness_cm',
    label: 'Soderagy vastagsag',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 15',
    relatedWorkflows: ['EARTHWORK'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'foundation',
    groupLabel: 'Alapozas es zsaluko',
    groupDescription: 'Az alaptest es a zsaluko mennyisegi szamitasahoz szukseges fo adatok.',
    paramKey: 'membrane_type',
    label: 'Alkalmazott folia',
    valueType: 'TEXT',
    input: 'text',
    placeholder: 'pl. PE folia 0,2 mm',
    relatedWorkflows: ['EARTHWORK', 'MASONRY'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'foundation',
    groupLabel: 'Alapozas es zsaluko',
    groupDescription: 'Az alaptest es a zsaluko mennyisegi szamitasahoz szukseges fo adatok.',
    paramKey: 'lean_concrete_area_m2',
    label: 'Szerelobeton brutto terulet',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 150',
    relatedWorkflows: ['EARTHWORK'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'foundation',
    groupLabel: 'Alapozas es zsaluko',
    groupDescription: 'Az alaptest es a zsaluko mennyisegi szamitasahoz szukseges fo adatok.',
    paramKey: 'lean_concrete_thickness_cm',
    label: 'Szerelobeton vastagsag',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 10',
    relatedWorkflows: ['EARTHWORK'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'masonry',
    groupLabel: 'Labazat es falazas',
    groupDescription: 'A labazat, fofalak, valaszfalak, pillerek es koszoru szamitasaihoz szukseges adatok.',
    paramKey: 'plinth_wall_height_cm',
    label: 'Labazati fal magassaga',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 60',
    relatedWorkflows: ['MASONRY', 'FACADE'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'masonry',
    groupLabel: 'Labazat es falazas',
    groupDescription: 'A labazat, fofalak, valaszfalak, pillerek es koszoru szamitasaihoz szukseges adatok.',
    paramKey: 'main_wall_material',
    label: 'Fofal anyaga',
    valueType: 'SINGLE_SELECT',
    input: 'select',
    options: [
      { value: 'porotherm_30', label: 'Porotherm 30' },
      { value: 'porotherm_38', label: 'Porotherm 38' },
      { value: 'ytong', label: 'Ytong' },
      { value: 'concrete_block', label: 'Betonblokk' },
      { value: 'other', label: 'Egyeb' },
    ],
    relatedWorkflows: ['MASONRY'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'masonry',
    groupLabel: 'Labazat es falazas',
    groupDescription: 'A labazat, fofalak, valaszfalak, pillerek es koszoru szamitasaihoz szukseges adatok.',
    paramKey: 'main_wall_length_m',
    label: 'Fofalak osszhossza',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm',
    placeholder: 'pl. 74',
    relatedWorkflows: ['MASONRY'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'masonry',
    groupLabel: 'Labazat es falazas',
    groupDescription: 'A labazat, fofalak, valaszfalak, pillerek es koszoru szamitasaihoz szukseges adatok.',
    paramKey: 'main_wall_height_cm',
    label: 'Fofalak magassaga',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 300',
    relatedWorkflows: ['MASONRY'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'masonry',
    groupLabel: 'Labazat es falazas',
    groupDescription: 'A labazat, fofalak, valaszfalak, pillerek es koszoru szamitasaihoz szukseges adatok.',
    paramKey: 'main_wall_brick_rows',
    label: 'Tegla sorok szama',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 12',
    relatedWorkflows: ['MASONRY'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'masonry',
    groupLabel: 'Labazat es falazas',
    groupDescription: 'A labazat, fofalak, valaszfalak, pillerek es koszoru szamitasaihoz szukseges adatok.',
    paramKey: 'ring_beam_type',
    label: 'Koszoru tipusa',
    valueType: 'SINGLE_SELECT',
    input: 'select',
    options: [
      { value: 'ceramic_u', label: 'Keramia U zsalu' },
      { value: 'monolithic_rc', label: 'Monolit vasbeton' },
    ],
    relatedWorkflows: ['MASONRY'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'masonry',
    groupLabel: 'Labazat es falazas',
    groupDescription: 'A labazat, fofalak, valaszfalak, pillerek es koszoru szamitasaihoz szukseges adatok.',
    paramKey: 'ring_beam_width_cm',
    label: 'Koszoru szelessege',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 25',
    relatedWorkflows: ['MASONRY'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'masonry',
    groupLabel: 'Labazat es falazas',
    groupDescription: 'A labazat, fofalak, valaszfalak, pillerek es koszoru szamitasaihoz szukseges adatok.',
    paramKey: 'ring_beam_height_cm',
    label: 'Koszoru magassaga',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 25',
    relatedWorkflows: ['MASONRY'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'masonry',
    groupLabel: 'Labazat es falazas',
    groupDescription: 'A labazat, fofalak, valaszfalak, pillerek es koszoru szamitasaihoz szukseges adatok.',
    paramKey: 'ring_beam_length_m',
    label: 'Koszoru hossza',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm',
    placeholder: 'pl. 58',
    relatedWorkflows: ['MASONRY'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'masonry',
    groupLabel: 'Labazat es falazas',
    groupDescription: 'A labazat, fofalak, valaszfalak, pillerek es koszoru szamitasaihoz szukseges adatok.',
    paramKey: 'partition_wall_material',
    label: 'Valaszfal anyaga',
    valueType: 'TEXT',
    input: 'text',
    placeholder: 'pl. 10 cm keramia valaszfal',
    relatedWorkflows: ['MASONRY', 'INTERIOR'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'masonry',
    groupLabel: 'Labazat es falazas',
    groupDescription: 'A labazat, fofalak, valaszfalak, pillerek es koszoru szamitasaihoz szukseges adatok.',
    paramKey: 'partition_wall_length_m',
    label: 'Valaszfal hossza',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm',
    placeholder: 'pl. 48',
    relatedWorkflows: ['INTERIOR', 'MASONRY'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'masonry',
    groupLabel: 'Labazat es falazas',
    groupDescription: 'A labazat, fofalak, valaszfalak, pillerek es koszoru szamitasaihoz szukseges adatok.',
    paramKey: 'interior_height_cm',
    label: 'Belmagassag',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 280',
    relatedWorkflows: ['INTERIOR', 'MASONRY', 'PAINTING'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'slab',
    groupLabel: 'Fodem',
    groupDescription: 'Fodemrendszer adatainak rogzitese a mennyisegek szamitasahoz.',
    paramKey: 'slab_type',
    label: 'Fodem tipusa',
    valueType: 'SINGLE_SELECT',
    input: 'select',
    options: [
      { value: 'monolithic', label: 'Monolit vasbeton' },
      { value: 'beam_block', label: 'Belestestes' },
      { value: 'timber', label: 'Fafodem' },
    ],
    relatedWorkflows: ['MASONRY', 'ROOFING'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'slab',
    groupLabel: 'Fodem',
    groupDescription: 'Fodemrendszer adatainak rogzitese a mennyisegek szamitasahoz.',
    paramKey: 'slab_thickness_cm',
    label: 'Fodem vastagsaga',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 20',
    relatedWorkflows: ['MASONRY', 'ROOFING'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'slab',
    groupLabel: 'Fodem',
    groupDescription: 'Fodemrendszer adatainak rogzitese a mennyisegek szamitasahoz.',
    paramKey: 'slab_area_m2',
    label: 'Fodem terulete',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 142',
    relatedWorkflows: ['MASONRY', 'ROOFING'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'slab',
    groupLabel: 'Fodem',
    groupDescription: 'Fodemrendszer adatainak rogzitese a mennyisegek szamitasahoz.',
    paramKey: 'slab_beam_spacing_cm',
    label: 'Gerendakiosztas',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 60',
    relatedWorkflows: ['MASONRY', 'ROOFING'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'roof',
    groupLabel: 'Tetoszerkezet',
    groupDescription: 'Tetofelulet, fedes es faanyag mennyisegek alapadatai.',
    paramKey: 'roof_type',
    label: 'Teto tipusa',
    valueType: 'SINGLE_SELECT',
    input: 'select',
    options: [
      { value: 'gable', label: 'Nyeregteto' },
      { value: 'hip', label: 'Satorteto' },
      { value: 'flat', label: 'Laposteto' },
    ],
    relatedWorkflows: ['ROOFING'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'roof',
    groupLabel: 'Tetoszerkezet',
    groupDescription: 'Tetofelulet, fedes es faanyag mennyisegek alapadatai.',
    paramKey: 'roof_pitch_deg',
    label: 'Teto hajlasszog',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'fok',
    placeholder: 'pl. 35',
    relatedWorkflows: ['ROOFING'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'roof',
    groupLabel: 'Tetoszerkezet',
    groupDescription: 'Tetofelulet, fedes es faanyag mennyisegek alapadatai.',
    paramKey: 'roof_plan_area_m2',
    label: 'Tetovetulet alapterulete',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 155',
    relatedWorkflows: ['ROOFING'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'roof',
    groupLabel: 'Tetoszerkezet',
    groupDescription: 'Tetofelulet, fedes es faanyag mennyisegek alapadatai.',
    paramKey: 'rafter_spacing_cm',
    label: 'Szarufa kiosztas',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 90',
    relatedWorkflows: ['ROOFING'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'roof',
    groupLabel: 'Tetoszerkezet',
    groupDescription: 'Tetofelulet, fedes es faanyag mennyisegek alapadatai.',
    paramKey: 'rafter_width_cm',
    label: 'Szarufa szelesseg',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 5',
    relatedWorkflows: ['ROOFING'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'roof',
    groupLabel: 'Tetoszerkezet',
    groupDescription: 'Tetofelulet, fedes es faanyag mennyisegek alapadatai.',
    paramKey: 'rafter_height_cm',
    label: 'Szarufa magassag',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 15',
    relatedWorkflows: ['ROOFING'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'roof',
    groupLabel: 'Tetoszerkezet',
    groupDescription: 'Tetofelulet, fedes es faanyag mennyisegek alapadatai.',
    paramKey: 'roof_covering_type',
    label: 'Hajazat tipusa',
    valueType: 'SINGLE_SELECT',
    input: 'select',
    options: [
      { value: 'tile', label: 'Cserep' },
      { value: 'sheet', label: 'Lemez' },
      { value: 'shingle', label: 'Zsindely' },
    ],
    relatedWorkflows: ['ROOFING'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'roof_insulation',
    groupLabel: 'Teto szigeteles',
    groupDescription: 'Tetoszigeteles es foliarendszer mennyisegekhez.',
    paramKey: 'roof_insulation_type',
    label: 'Szigeteles tipusa',
    valueType: 'TEXT',
    input: 'text',
    placeholder: 'pl. kozetgyapot',
    relatedWorkflows: ['ROOFING'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'roof_insulation',
    groupLabel: 'Teto szigeteles',
    groupDescription: 'Tetoszigeteles es foliarendszer mennyisegekhez.',
    paramKey: 'roof_insulation_thickness_cm',
    label: 'Szigeteles vastagsaga',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 25',
    relatedWorkflows: ['ROOFING'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'roof_insulation',
    groupLabel: 'Teto szigeteles',
    groupDescription: 'Tetoszigeteles es foliarendszer mennyisegekhez.',
    paramKey: 'roof_insulation_layers',
    label: 'Retegszam',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 2',
    relatedWorkflows: ['ROOFING'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'facade',
    groupLabel: 'Homlokzat szigeteles es szinezes',
    groupDescription: 'Homlokzati szigeteles, halozas, alapozas es vakolat mennyisegeihez.',
    paramKey: 'facade_wall_area_m2',
    label: 'Homlokzati fal felulet',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 210',
    relatedWorkflows: ['FACADE'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'facade',
    groupLabel: 'Homlokzat szigeteles es szinezes',
    groupDescription: 'Homlokzati szigeteles, halozas, alapozas es vakolat mennyisegeihez.',
    paramKey: 'facade_openings_deduction_m2',
    label: 'Nyilaszarok levonasa',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 32',
    relatedWorkflows: ['FACADE', 'OPENINGS'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'facade',
    groupLabel: 'Homlokzat szigeteles es szinezes',
    groupDescription: 'Homlokzati szigeteles, halozas, alapozas es vakolat mennyisegeihez.',
    paramKey: 'facade_insulation_type',
    label: 'Szigeteles anyaga',
    valueType: 'SINGLE_SELECT',
    input: 'select',
    options: [
      { value: 'eps', label: 'EPS' },
      { value: 'graphite_eps', label: 'Grafitos EPS' },
      { value: 'rockwool', label: 'Kozetgyapot' },
    ],
    relatedWorkflows: ['FACADE'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'facade',
    groupLabel: 'Homlokzat szigeteles es szinezes',
    groupDescription: 'Homlokzati szigeteles, halozas, alapozas es vakolat mennyisegeihez.',
    paramKey: 'facade_insulation_thickness_cm',
    label: 'Szigeteles vastagsaga',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 15',
    relatedWorkflows: ['FACADE'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'facade',
    groupLabel: 'Homlokzat szigeteles es szinezes',
    groupDescription: 'Homlokzati szigeteles, halozas, alapozas es vakolat mennyisegeihez.',
    paramKey: 'facade_finish_area_m2',
    label: 'Szinezendo felulet',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 178',
    relatedWorkflows: ['FACADE', 'PAINTING'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'facade',
    groupLabel: 'Homlokzat szigeteles es szinezes',
    groupDescription: 'Homlokzati szigeteles, halozas, alapozas es vakolat mennyisegeihez.',
    paramKey: 'facade_finish_material',
    label: 'Szinezoanyag / vakolat tipusa',
    valueType: 'TEXT',
    input: 'text',
    placeholder: 'pl. szilikonos vekonyvakolat',
    relatedWorkflows: ['FACADE', 'PAINTING'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'floor_layers',
    groupLabel: 'Aljzat retegrend',
    groupDescription: 'Aljzat retegrend es aljzatbeton mennyisegek.',
    paramKey: 'floor_layer_area_m2',
    label: 'Alapterulet',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 142',
    relatedWorkflows: ['INTERIOR', 'TILING', 'MECHANICAL'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'floor_layers',
    groupLabel: 'Aljzat retegrend',
    groupDescription: 'Aljzat retegrend es aljzatbeton mennyisegek.',
    paramKey: 'floor_gravel_thickness_cm',
    label: 'Soderagy vastagsag',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 15',
    relatedWorkflows: ['INTERIOR'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'floor_layers',
    groupLabel: 'Aljzat retegrend',
    groupDescription: 'Aljzat retegrend es aljzatbeton mennyisegek.',
    paramKey: 'floor_lean_concrete_thickness_cm',
    label: 'Szerelobeton vastagsag',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 10',
    relatedWorkflows: ['INTERIOR'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'floor_layers',
    groupLabel: 'Aljzat retegrend',
    groupDescription: 'Aljzat retegrend es aljzatbeton mennyisegek.',
    paramKey: 'floor_thermal_insulation_thickness_cm',
    label: 'Hoszigeteles vastagsaga',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 12',
    relatedWorkflows: ['INTERIOR', 'MECHANICAL'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'floor_layers',
    groupLabel: 'Aljzat retegrend',
    groupDescription: 'Aljzat retegrend es aljzatbeton mennyisegek.',
    paramKey: 'estrich_thickness_cm',
    label: 'Estrich vastagsag',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 6',
    relatedWorkflows: ['INTERIOR', 'TILING', 'MECHANICAL'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'finishes',
    groupLabel: 'Belso feluletek',
    groupDescription: 'Vakolas, festes, burkolas es gipszkarton mennyisegek.',
    paramKey: 'internal_plaster_area_m2',
    label: 'Belso vakolando felulet',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 360',
    relatedWorkflows: ['INTERIOR', 'PAINTING'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'finishes',
    groupLabel: 'Belso feluletek',
    groupDescription: 'Vakolas, festes, burkolas es gipszkarton mennyisegek.',
    paramKey: 'plaster_thickness_mm',
    label: 'Vakolat vastagsaga',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'mm',
    placeholder: 'pl. 15',
    relatedWorkflows: ['INTERIOR', 'PAINTING'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'finishes',
    groupLabel: 'Belso feluletek',
    groupDescription: 'Vakolas, festes, burkolas es gipszkarton mennyisegek.',
    paramKey: 'paint_area_m2',
    label: 'Festendo felulet',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 410',
    relatedWorkflows: ['PAINTING'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'finishes',
    groupLabel: 'Belso feluletek',
    groupDescription: 'Vakolas, festes, burkolas es gipszkarton mennyisegek.',
    paramKey: 'paint_layers',
    label: 'Festek retegek szama',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 2',
    relatedWorkflows: ['PAINTING'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'finishes',
    groupLabel: 'Belso feluletek',
    groupDescription: 'Vakolas, festes, burkolas es gipszkarton mennyisegek.',
    paramKey: 'tile_floor_area_m2',
    label: 'Padloburkolat terulete',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 82',
    relatedWorkflows: ['TILING'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'finishes',
    groupLabel: 'Belso feluletek',
    groupDescription: 'Vakolas, festes, burkolas es gipszkarton mennyisegek.',
    paramKey: 'tile_wall_area_m2',
    label: 'Falburkolat terulete',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 46',
    relatedWorkflows: ['TILING'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'finishes',
    groupLabel: 'Belso feluletek',
    groupDescription: 'Vakolas, festes, burkolas es gipszkarton mennyisegek.',
    paramKey: 'tile_length_cm',
    label: 'Burkololap hossza',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 60',
    relatedWorkflows: ['TILING'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'finishes',
    groupLabel: 'Belso feluletek',
    groupDescription: 'Vakolas, festes, burkolas es gipszkarton mennyisegek.',
    paramKey: 'tile_width_cm',
    label: 'Burkololap szelessege',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 60',
    relatedWorkflows: ['TILING'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'finishes',
    groupLabel: 'Belso feluletek',
    groupDescription: 'Vakolas, festes, burkolas es gipszkarton mennyisegek.',
    paramKey: 'drywall_ceiling_area_m2',
    label: 'Gipszkarton mennyezet',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 95',
    relatedWorkflows: ['INTERIOR'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'finishes',
    groupLabel: 'Belso feluletek',
    groupDescription: 'Vakolas, festes, burkolas es gipszkarton mennyisegek.',
    paramKey: 'drywall_spacing_cm',
    label: 'Gipszkarton vaz kiosztas',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 40',
    relatedWorkflows: ['INTERIOR'],
  },
  {
    section: 'MEP',
    groupKey: 'heating',
    groupLabel: 'Padlofutes es futes',
    groupDescription: 'Padlofuteses hoszivattyus rendszer fo adatai.',
    paramKey: 'heated_floor_area_m2',
    label: 'Futott alapterulet',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 128',
    relatedWorkflows: ['MECHANICAL'],
  },
  {
    section: 'MEP',
    groupKey: 'heating',
    groupLabel: 'Padlofutes es futes',
    groupDescription: 'Padlofuteses hoszivattyus rendszer fo adatai.',
    paramKey: 'underfloor_pipe_spacing_cm',
    label: 'Csoosztas',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 15',
    relatedWorkflows: ['MECHANICAL'],
  },
  {
    section: 'MEP',
    groupKey: 'heating',
    groupLabel: 'Padlofutes es futes',
    groupDescription: 'Padlofuteses hoszivattyus rendszer fo adatai.',
    paramKey: 'heating_circuit_count',
    label: 'Korok szama',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 10',
    relatedWorkflows: ['MECHANICAL'],
  },
  {
    section: 'MEP',
    groupKey: 'plumbing',
    groupLabel: 'Vizszereles es gepeszet',
    groupDescription: 'Vizszereles, csatorna es gepeszeti alapadatok.',
    paramKey: 'wet_room_count',
    label: 'Vizes helyisegek szama',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 3',
    relatedWorkflows: ['MECHANICAL'],
  },
  {
    section: 'MEP',
    groupKey: 'plumbing',
    groupLabel: 'Vizszereles es gepeszet',
    groupDescription: 'Vizszereles, csatorna es gepeszeti alapadatok.',
    paramKey: 'fixture_point_count',
    label: 'Kifolyasi pontok szama',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 18',
    relatedWorkflows: ['MECHANICAL'],
  },
  {
    section: 'MEP',
    groupKey: 'plumbing',
    groupLabel: 'Vizszereles es gepeszet',
    groupDescription: 'Vizszereles, csatorna es gepeszeti alapadatok.',
    paramKey: 'heating_system_type',
    label: 'Futesi rendszer tipusa',
    valueType: 'TEXT',
    input: 'text',
    placeholder: 'pl. hoszivattyu + padlofutes',
    relatedWorkflows: ['MECHANICAL'],
  },
  {
    section: 'MEP',
    groupKey: 'plumbing',
    groupLabel: 'Vizszereles es gepeszet',
    groupDescription: 'Vizszereles, csatorna es gepeszeti alapadatok.',
    paramKey: 'cooling_enabled',
    label: 'Van hutes',
    valueType: 'BOOLEAN',
    input: 'boolean',
    options: yesNoOptions,
    relatedWorkflows: ['MECHANICAL'],
  },
  {
    section: 'MEP',
    groupKey: 'plumbing',
    groupLabel: 'Vizszereles es gepeszet',
    groupDescription: 'Vizszereles, csatorna es gepeszeti alapadatok.',
    paramKey: 'ventilation_type',
    label: 'Szelloztetes tipusa',
    valueType: 'TEXT',
    input: 'text',
    placeholder: 'pl. hovisszanyeros',
    relatedWorkflows: ['MECHANICAL'],
  },
  {
    section: 'MEP',
    groupKey: 'electrical',
    groupLabel: 'Villanyszereles',
    groupDescription: 'Villanyszereles alapmennyisegeinek meghatarozasahoz.',
    paramKey: 'socket_count',
    label: 'Dugaljak darabszama',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 58',
    relatedWorkflows: ['ELECTRICAL'],
  },
  {
    section: 'MEP',
    groupKey: 'electrical',
    groupLabel: 'Villanyszereles',
    groupDescription: 'Villanyszereles alapmennyisegeinek meghatarozasahoz.',
    paramKey: 'switch_count',
    label: 'Kapcsolok darabszama',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 26',
    relatedWorkflows: ['ELECTRICAL'],
  },
  {
    section: 'MEP',
    groupKey: 'electrical',
    groupLabel: 'Villanyszereles',
    groupDescription: 'Villanyszereles alapmennyisegeinek meghatarozasahoz.',
    paramKey: 'luminaire_count',
    label: 'Lampatestek darabszama',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 34',
    relatedWorkflows: ['ELECTRICAL'],
  },
  {
    section: 'MEP',
    groupKey: 'electrical',
    groupLabel: 'Villanyszereles',
    groupDescription: 'Villanyszereles alapmennyisegeinek meghatarozasahoz.',
    paramKey: 'electrical_scope_type',
    label: 'Villamos rendszer',
    valueType: 'SINGLE_SELECT',
    input: 'select',
    options: [
      { value: 'strong_only', label: 'Csak erosaram' },
      { value: 'strong_and_weak', label: 'Erosaram + gyengearam' },
    ],
    relatedWorkflows: ['ELECTRICAL'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'openings',
    groupLabel: 'Nyilaszarok',
    groupDescription: 'Nyilaszarok darabszama es beepitesi anyagai.',
    paramKey: 'window_count',
    label: 'Ablakok darabszama',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 14',
    relatedWorkflows: ['OPENINGS'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'openings',
    groupLabel: 'Nyilaszarok',
    groupDescription: 'Nyilaszarok darabszama es beepitesi anyagai.',
    paramKey: 'door_count',
    label: 'Ajtok darabszama',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 3',
    relatedWorkflows: ['OPENINGS'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'openings',
    groupLabel: 'Nyilaszarok',
    groupDescription: 'Nyilaszarok darabszama es beepitesi anyagai.',
    paramKey: 'opening_installation_perimeter_m',
    label: 'Beepitesi osszkerulet',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm',
    placeholder: 'pl. 82',
    relatedWorkflows: ['OPENINGS'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'external_works',
    groupLabel: 'Kulso munkak',
    groupDescription: 'Terkoburkolat, kocsibeallo, kerites es pergola mennyisegek.',
    paramKey: 'paving_area_m2',
    label: 'Terkoburkolat terulete',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 88',
    relatedWorkflows: ['OTHER'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'external_works',
    groupLabel: 'Kulso munkak',
    groupDescription: 'Terkoburkolat, kocsibeallo, kerites es pergola mennyisegek.',
    paramKey: 'fence_length_m',
    label: 'Kerites hossza',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm',
    placeholder: 'pl. 34',
    relatedWorkflows: ['OTHER'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'external_works',
    groupLabel: 'Kulso munkak',
    groupDescription: 'Terkoburkolat, kocsibeallo, kerites es pergola mennyisegek.',
    paramKey: 'driveway_area_m2',
    label: 'Kocsibeallo terulete',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 32',
    relatedWorkflows: ['OTHER'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'external_works',
    groupLabel: 'Kulso munkak',
    groupDescription: 'Terkoburkolat, kocsibeallo, kerites es pergola mennyisegek.',
    paramKey: 'pergola_area_m2',
    label: 'Pergola terulete',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 18',
    relatedWorkflows: ['OTHER'],
  },
  {
    section: 'SUBCONTRACTOR_PREP',
    groupKey: 'subcontractors',
    groupLabel: 'Alvallalkozoi csomag',
    groupDescription: 'A szakipari munkak kiszervezesehez es ellenorzeshez szukseges adatok.',
    paramKey: 'contract_scope_summary',
    label: 'Szerzodeses muszaki tartalom',
    valueType: 'TEXT',
    input: 'textarea',
    placeholder: 'Milyen muszaki tartalom keruljon a szakipari szerzodesekbe?',
    relatedWorkflows: ['EARTHWORK', 'MASONRY', 'ROOFING', 'FACADE', 'OPENINGS', 'ELECTRICAL', 'MECHANICAL', 'INTERIOR', 'PAINTING', 'TILING', 'OTHER'],
  },
  {
    section: 'SUBCONTRACTOR_PREP',
    groupKey: 'subcontractors',
    groupLabel: 'Alvallalkozoi csomag',
    groupDescription: 'A szakipari munkak kiszervezesehez es ellenorzeshez szukseges adatok.',
    paramKey: 'site_documentation_checklist',
    label: 'Kivitelezesi dokumentacios checklista',
    valueType: 'TEXT',
    input: 'textarea',
    placeholder: 'pl. napi munkanaplo, fazisfotok, atadasi jegyzokonyv, meresi naplo',
    relatedWorkflows: ['EARTHWORK', 'MASONRY', 'ROOFING', 'FACADE', 'OPENINGS', 'ELECTRICAL', 'MECHANICAL', 'INTERIOR', 'PAINTING', 'TILING', 'OTHER'],
  },
  {
    section: 'SUBCONTRACTOR_PREP',
    groupKey: 'subcontractors',
    groupLabel: 'Alvallalkozoi csomag',
    groupDescription: 'A szakipari munkak kiszervezesehez es ellenorzeshez szukseges adatok.',
    paramKey: 'settlement_rule_notes',
    label: 'Elszamolasi feltetelek',
    valueType: 'TEXT',
    input: 'textarea',
    placeholder: 'pl. a hianytalan dokumentacio az elszamolas feltetele',
    relatedWorkflows: ['EARTHWORK', 'MASONRY', 'ROOFING', 'FACADE', 'OPENINGS', 'ELECTRICAL', 'MECHANICAL', 'INTERIOR', 'PAINTING', 'TILING', 'OTHER'],
  },
];

export const technicalSummaryTemplates: Array<{
  key: string;
  title: string;
  workflow: ProjectWorkflowTemplate;
  relevantParams: string[];
}> = [
  { key: 'earthwork', title: 'Foldmunka es alapozas', workflow: 'EARTHWORK', relevantParams: ['foundation_depth_cm', 'foundation_width_cm', 'foundation_length_m', 'zsaluko_rows_count'] },
  { key: 'masonry', title: 'Falazas es koszoru', workflow: 'MASONRY', relevantParams: ['main_wall_material', 'main_wall_length_m', 'main_wall_height_cm', 'ring_beam_type'] },
  { key: 'roofing', title: 'Fodem es teto', workflow: 'ROOFING', relevantParams: ['slab_type', 'slab_area_m2', 'roof_type', 'roof_plan_area_m2', 'roof_covering_type'] },
  { key: 'facade', title: 'Homlokzat', workflow: 'FACADE', relevantParams: ['facade_wall_area_m2', 'facade_openings_deduction_m2', 'facade_insulation_type', 'facade_insulation_thickness_cm'] },
  { key: 'openings', title: 'Nyilaszarok', workflow: 'OPENINGS', relevantParams: ['window_count', 'door_count', 'opening_installation_perimeter_m'] },
  { key: 'mechanical', title: 'Gepeszet', workflow: 'MECHANICAL', relevantParams: ['heated_floor_area_m2', 'underfloor_pipe_spacing_cm', 'wet_room_count', 'fixture_point_count'] },
  { key: 'electrical', title: 'Villanyszereles', workflow: 'ELECTRICAL', relevantParams: ['socket_count', 'switch_count', 'luminaire_count', 'electrical_scope_type'] },
  { key: 'interior', title: 'Belso munkak', workflow: 'INTERIOR', relevantParams: ['floor_layer_area_m2', 'internal_plaster_area_m2', 'drywall_ceiling_area_m2'] },
  { key: 'painting', title: 'Festes', workflow: 'PAINTING', relevantParams: ['paint_area_m2', 'paint_layers'] },
  { key: 'tiling', title: 'Burkolas', workflow: 'TILING', relevantParams: ['tile_floor_area_m2', 'tile_wall_area_m2', 'tile_length_cm', 'tile_width_cm'] },
];

export function getTechnicalGroups(section: ProjectTechnicalSection) {
  const definitions = technicalFieldDefinitions.filter((field) => field.section === section);
  const groups = new Map<string, { key: string; label: string; description: string; fields: TechnicalFieldDefinition[] }>();

  for (const definition of definitions) {
    if (!groups.has(definition.groupKey)) {
      groups.set(definition.groupKey, {
        key: definition.groupKey,
        label: definition.groupLabel,
        description: definition.groupDescription,
        fields: [],
      });
    }

    groups.get(definition.groupKey)?.fields.push(definition);
  }

  return Array.from(groups.values());
}

export function formatTechnicalValue(parameter: {
  textValue: string | null;
  numberValue: number | null;
  booleanValue: boolean | null;
  unit: string | null;
}) {
  if (parameter.numberValue !== null) {
    return `${formatNumber(parameter.numberValue)}${parameter.unit ? ` ${parameter.unit}` : ''}`;
  }

  if (parameter.booleanValue !== null) {
    return parameter.booleanValue ? 'Igen' : 'Nem';
  }

  return parameter.textValue || 'Nincs megadva';
}

export function buildTechnicalSummaryCards(
  parameters: TechnicalParameterValue[],
  workflows: Array<{ id: string; name: string; template: ProjectWorkflowTemplate }>,
) {
  const technicalValueMap = new Map(parameters.map((parameter) => [parameter.paramKey, parameter]));
  const calculationGroups = buildTechnicalCalculationGroups(parameters);
  const calculationMap = new Map(calculationGroups.map((group) => [group.key, group]));

  return technicalSummaryTemplates.map((summary) => {
    const populated = summary.relevantParams
      .map((paramKey) => technicalValueMap.get(paramKey))
      .filter((parameter): parameter is TechnicalParameterValue => Boolean(parameter));
    const calculations = calculationMap.get(summary.key)?.items || [];

    return {
      ...summary,
      ready: populated.length > 0,
      completion: `${populated.length}/${summary.relevantParams.length}`,
      lines: [
        ...populated.slice(0, 3).map((parameter) => `${parameter.label}: ${formatTechnicalValue(parameter)}`),
        ...calculations.slice(0, 2).map((item) => `${item.label}: ${item.value}`),
      ],
      relatedWorkflow: workflows.find((workflow) => workflow.template === summary.workflow),
      missingCount: summary.relevantParams.length - populated.length,
    };
  });
}

export function buildTechnicalCalculationGroups(parameters: TechnicalParameterValue[]): TechnicalCalculationGroup[] {
  const metric = createMetricReader(parameters);

  const groups: TechnicalCalculationGroup[] = [
    buildFoundationCalculations(metric),
    buildMasonryCalculations(metric),
    buildSlabCalculations(metric),
    buildRoofCalculations(metric),
    buildRoofInsulationCalculations(metric),
    buildFacadeCalculations(metric),
    buildFloorLayerCalculations(metric),
    buildHeatingCalculations(metric),
    buildPlumbingCalculations(metric),
    buildElectricalCalculations(metric),
    buildFinishesCalculations(metric),
    buildOpeningsCalculations(metric),
    buildExternalWorksCalculations(metric),
  ];

  return groups.filter((group) => group.items.length > 0);
}

export const workflowDocumentRequirements: Partial<Record<ProjectWorkflowTemplate, WorkflowDocumentRequirement[]>> = {
  EARTHWORK: [
    { key: 'foundation_plan', label: 'Alapozasi reszlet', description: 'Alapozasi reszletek, melysegek es metszetek.', required: true },
    { key: 'soil_log', label: 'Talaj es foldmunka jegyzet', description: 'Talajmechanika vagy helyszini foldmunka megjegyzes.', required: false },
  ],
  MASONRY: [
    { key: 'wall_plan', label: 'Falazati terv', description: 'Fofal es koszoru kiosztas tervlapja.', required: true },
    { key: 'structural_plan', label: 'Statikai reszlet', description: 'Pillerek, koszoru es teherhordo szerkezetek reszletei.', required: true },
  ],
  ROOFING: [
    { key: 'roof_plan', label: 'Tetoterv', description: 'Tetogeometria, fedes es csomopontok.', required: true },
    { key: 'cover_selection', label: 'Hajazat valasztas', description: 'Cserep, lemez vagy zsindely vegleges dokumentacioja.', required: false },
  ],
  FACADE: [
    { key: 'facade_plan', label: 'Homlokzati terv', description: 'Homlokzati tervlap vagy anyagkiiras.', required: true },
    { key: 'color_approval', label: 'Szinjovahagyas', description: 'Vegleges homlokzati szin vagy mintafeluletek.', required: true },
  ],
  OPENINGS: [
    { key: 'opening_schedule', label: 'Nyilaszarolista', description: 'Darabszam, meret es tipuslista.', required: true },
    { key: 'measurement_record', label: 'Felmeresi jegyzokonyv', description: 'Beepiteshez keszult helyszini felmeres.', required: true },
  ],
  ELECTRICAL: [
    { key: 'electrical_plan', label: 'Villamos terv', description: 'Kapcsolok, dugaljak, lampatestek es korok terve.', required: true },
    { key: 'device_selection', label: 'Szerelveny valasztas', description: 'Kapcsolocsalad vagy villamos szerelvenyek jovahagyasa.', required: false },
  ],
  MECHANICAL: [
    { key: 'mechanical_plan', label: 'Gepeszeti terv', description: 'Futes, viz, csatorna, hoszivattyu es szelloztetes.', required: true },
    { key: 'machine_schedule', label: 'Gepeszeti gepjegyzek', description: 'Hoszivattyu, oszto-gyujto, szaniterek vagy egyeb gepek listaja.', required: false },
  ],
  INTERIOR: [
    { key: 'interior_package', label: 'Belso muszaki csomag', description: 'Vakolas, gipszkarton es belso eloirasok.', required: false },
  ],
  PAINTING: [
    { key: 'paint_schedule', label: 'Festesi szinlap', description: 'Helyisegenkenti szinlista es retegszam.', required: true },
  ],
  TILING: [
    { key: 'tile_schedule', label: 'Burkolatkiosztas', description: 'Padlo- es falburkolatok kiosztasa es lapmeretei.', required: true },
    { key: 'tile_selection', label: 'Burkolat valasztas', description: 'Vegleges lap, fuga es kiegeszito valasztas.', required: true },
  ],
  OTHER: [
    { key: 'execution_package', label: 'Szakipari csomag', description: 'Kulso munkakhoz vagy egyedi szakaghoz tartozo dokumentacio.', required: false },
  ],
};

function buildFoundationCalculations(metric: ReturnType<typeof createMetricReader>): TechnicalCalculationGroup {
  const length = metric.number('foundation_length_m');
  const width = cmToM(metric.number('foundation_width_cm'));
  const depth = cmToM(metric.number('foundation_depth_cm'));
  const corners = metric.number('foundation_corner_count');
  const rowHeight = cmToM(metric.number('zsaluko_row_height_cm'));
  const rows = metric.number('zsaluko_rows_count');
  const netArea = metric.number('net_floor_area_m2');
  const fillDepth = cmToM(metric.number('fill_soil_depth_cm'));
  const gravelDepth = cmToM(metric.number('gravel_bed_thickness_cm'));
  const leanArea = metric.number('lean_concrete_area_m2');
  const leanThickness = cmToM(metric.number('lean_concrete_thickness_cm'));

  const concrete = length && width && depth ? length * width * depth : 0;
  const mainSteelLength = length ? length * 5 : 0;
  const stirrupCount = length ? Math.ceil(length / 0.25) : 0;
  const stirrupLength = width && depth ? (2 * (width + depth) + 0.2) : 0;
  const stirrupSteel = stirrupCount * stirrupLength;
  const cornerBars = corners ? corners * 1.2 : 0;
  const steelKg = rebarWeight(mainSteelLength + cornerBars, 12) + rebarWeight(stirrupSteel, 8);

  const blocksPerRow = length ? Math.ceil(length / 0.5) : 0;
  const zsalukoCount = blocksPerRow && rows ? blocksPerRow * rows : 0;
  const zsalukoConcrete = zsalukoCount ? zsalukoCount * 0.012 : 0;
  const zsalukoSteel = zsalukoCount ? rebarWeight((blocksPerRow + (corners || 0)) * (rowHeight || 0) * (rows || 0) + length * (rows || 0) * 2, 10) : 0;
  const fillSoil = netArea && fillDepth ? netArea * fillDepth : 0;
  const gravel = netArea && gravelDepth ? netArea * gravelDepth : 0;
  const membrane = netArea ? netArea * 1.1 : 0;
  const leanConcrete = leanArea && leanThickness ? leanArea * leanThickness : 0;

  return {
    key: 'earthwork',
    title: 'Foldmunka es alapozas szamitas',
    note: 'A vasalat 5 fo vassal, kengyeles kiosztassal es pipavasakkal becsult mennyiseg.',
    items: compactItems([
      asItem('Alaptest beton', concrete, 'm3'),
      asItem('Alaptest vasalat', steelKg, 'kg'),
      asItem('Zsaluko darabszam', zsalukoCount, 'db'),
      asItem('Zsaluko beton', zsalukoConcrete, 'm3'),
      asItem('Zsaluko vasalat', zsalukoSteel, 'kg'),
      asItem('Toltofold', fillSoil, 'm3'),
      asItem('Soderagy', gravel, 'm3'),
      asItem('Folia', membrane, 'm2'),
      asItem('Szerelobeton', leanConcrete, 'm3'),
    ]),
  };
}

function buildMasonryCalculations(metric: ReturnType<typeof createMetricReader>): TechnicalCalculationGroup {
  const wallLength = metric.number('main_wall_length_m');
  const wallHeight = cmToM(metric.number('main_wall_height_cm'));
  const plinthHeight = cmToM(metric.number('plinth_wall_height_cm'));
  const material = metric.text('main_wall_material');
  const ringType = metric.text('ring_beam_type');
  const ringWidth = cmToM(metric.number('ring_beam_width_cm'));
  const ringHeight = cmToM(metric.number('ring_beam_height_cm'));
  const ringLength = metric.number('ring_beam_length_m');
  const partitionLength = metric.number('partition_wall_length_m');
  const interiorHeight = cmToM(metric.number('interior_height_cm'));

  const plinthInsulation = wallLength && plinthHeight ? wallLength * plinthHeight : 0;
  const wallArea = wallLength && wallHeight ? wallLength * wallHeight : 0;
  const brickPerM2 = material === 'porotherm_38' ? 16 : material === 'ytong' ? 8 : 16;
  const brickCount = wallArea ? Math.ceil(wallArea * brickPerM2) : 0;
  const adhesiveBags = wallArea ? Math.ceil(wallArea / 5) : 0;
  const pillarCount = wallLength ? Math.max(2, Math.ceil(wallLength / 6)) : 0;
  const pillarConcrete = pillarCount && wallHeight ? pillarCount * 0.3 * 0.3 * wallHeight : 0;
  const pillarSteel = pillarCount && wallHeight
    ? rebarWeight(pillarCount * wallHeight * 4, 12) + rebarWeight(pillarCount * Math.ceil((wallHeight || 0) / 0.2) * 1.1, 8)
    : 0;
  const ringConcrete = ringLength && ringWidth && ringHeight ? ringLength * ringWidth * ringHeight : 0;
  const ringSteel = ringLength && ringWidth && ringHeight
    ? rebarWeight(ringLength * 4, 12) + rebarWeight(Math.ceil(ringLength / 0.25) * (2 * (ringWidth + ringHeight) + 0.2), 8)
    : 0;
  const uBlockCount = ringType === 'ceramic_u' && ringLength ? Math.ceil(ringLength / 0.5) : 0;
  const partitionArea = partitionLength && interiorHeight ? partitionLength * interiorHeight : 0;

  return {
    key: 'masonry',
    title: 'Falazas es koszoru szamitas',
    note: 'A tartopillerek 6 m-enkent, 30x30 cm merettel es kengyeles vasalattal vannak becsulve.',
    items: compactItems([
      asItem('Labazatszigeteles', plinthInsulation, 'm2'),
      asItem('Fofal tégla', brickCount, 'db'),
      asItem('Falazo ragaszto', adhesiveBags, 'zsak'),
      asItem('Tartopillerek', pillarCount, 'db'),
      asItem('Pillerek betonja', pillarConcrete, 'm3'),
      asItem('Pillerek vasalata', pillarSteel, 'kg'),
      asItem('Koszoru beton', ringConcrete, 'm3'),
      asItem(ringType === 'ceramic_u' ? 'U zsalu' : 'Koszoru vasalat', ringType === 'ceramic_u' ? uBlockCount : ringSteel, ringType === 'ceramic_u' ? 'db' : 'kg'),
      asItem('Valaszfal felulet', partitionArea, 'm2'),
    ]),
  };
}

function buildSlabCalculations(metric: ReturnType<typeof createMetricReader>): TechnicalCalculationGroup {
  const slabType = metric.text('slab_type');
  const area = metric.number('slab_area_m2');
  const thickness = cmToM(metric.number('slab_thickness_cm'));
  const spacing = cmToM(metric.number('slab_beam_spacing_cm'));

  const concrete = area && thickness ? area * thickness : 0;
  const formwork = area || 0;
  const monolithicSteel = area ? area * 14 : 0;
  const beamCount = area && spacing ? Math.ceil(Math.sqrt(area) / spacing) + 1 : 0;
  const beamBlocks = area ? Math.ceil(area * 8) : 0;
  const toppingConcrete = area ? area * 0.05 : 0;
  const beamSteel = area ? area * 3.5 : 0;

  return {
    key: 'roofing',
    title: 'Fodem szamitas',
    note: 'Belestestes rendszerben becsult gerenda- es béléstestmennyiseg jelenik meg.',
    items: compactItems([
      slabType === 'monolithic' ? asItem('Monolit beton', concrete, 'm3') : null,
      slabType === 'monolithic' ? asItem('Monolit vasalat', monolithicSteel, 'kg') : null,
      slabType === 'monolithic' ? asItem('Monolit zsaluzat', formwork, 'm2') : null,
      slabType === 'beam_block' ? asItem('Gerendak', beamCount, 'db') : null,
      slabType === 'beam_block' ? asItem('Belestestek', beamBlocks, 'db') : null,
      slabType === 'beam_block' ? asItem('Felbeton', toppingConcrete, 'm3') : null,
      slabType === 'beam_block' ? asItem('Vasalat', beamSteel, 'kg') : null,
      slabType === 'timber' ? asItem('Fafodem teherhordo faanyag', area ? area * 0.08 : 0, 'm3') : null,
    ]),
  };
}

function buildRoofCalculations(metric: ReturnType<typeof createMetricReader>): TechnicalCalculationGroup {
  const roofType = metric.text('roof_type');
  const pitch = metric.number('roof_pitch_deg');
  const planArea = metric.number('roof_plan_area_m2');
  const spacing = cmToM(metric.number('rafter_spacing_cm'));
  const width = cmToM(metric.number('rafter_width_cm'));
  const height = cmToM(metric.number('rafter_height_cm'));
  const covering = metric.text('roof_covering_type');

  const multiplier = roofType === 'flat'
    ? 1
    : pitch
      ? 1 / Math.cos((pitch * Math.PI) / 180)
      : 1.15;
  const roofArea = planArea ? planArea * multiplier : 0;
  const rafterCount = planArea && spacing ? Math.ceil(Math.sqrt(planArea) / spacing) + 1 : 0;
  const avgRafterLength = roofArea ? Math.sqrt(roofArea) * 0.75 : 0;
  const timber = rafterCount && avgRafterLength && width && height ? rafterCount * avgRafterLength * width * height : 0;
  const battenLm = roofArea ? roofArea * 3.2 : 0;
  const counterBattenLm = roofArea ? roofArea * 1.4 : 0;
  const foil = roofArea ? roofArea * 1.1 : 0;
  const coveringQty = covering === 'tile'
    ? roofArea * 10
    : covering === 'sheet'
      ? roofArea * 1.05
      : covering === 'shingle'
        ? roofArea / 3
        : 0;

  return {
    key: 'roofing',
    title: 'Tetoszerkezet szamitas',
    note: 'A tetofelulet a hajlasszogbol es a vetuleti teruletbol szamolt kozelito ertek.',
    items: compactItems([
      asItem('Tetofelulet', roofArea, 'm2'),
      asItem('Szarufak', rafterCount, 'db'),
      asItem('Faanyag', timber, 'm3'),
      asItem('Lecezes', battenLm, 'fm'),
      asItem('Ellenlec', counterBattenLm, 'fm'),
      asItem('Tetofolia', foil, 'm2'),
      covering === 'tile' ? asItem('Cserep', coveringQty, 'db') : null,
      covering === 'sheet' ? asItem('Lemezfedes', coveringQty, 'm2') : null,
      covering === 'shingle' ? asItem('Zsindely csomag', coveringQty, 'csomag') : null,
    ]),
  };
}

function buildRoofInsulationCalculations(metric: ReturnType<typeof createMetricReader>): TechnicalCalculationGroup {
  const planArea = metric.number('roof_plan_area_m2');
  const pitch = metric.number('roof_pitch_deg');
  const thickness = cmToM(metric.number('roof_insulation_thickness_cm'));
  const layers = metric.number('roof_insulation_layers');
  const roofArea = planArea && pitch ? planArea * (1 / Math.cos((pitch * Math.PI) / 180)) : planArea;
  const insulation = roofArea && thickness ? roofArea * thickness * (layers || 1) : 0;

  return {
    key: 'roofing',
    title: 'Tetoszigeteles szamitas',
    note: 'A foliamennyisegek 10% rafagyassal szerepelnek.',
    items: compactItems([
      asItem('Szigeteles', insulation, 'm3'),
      asItem('Parazaro folia', roofArea ? roofArea * 1.1 : 0, 'm2'),
      asItem('Paraatereszto folia', roofArea ? roofArea * 1.1 : 0, 'm2'),
    ]),
  };
}

function buildFacadeCalculations(metric: ReturnType<typeof createMetricReader>): TechnicalCalculationGroup {
  const wallArea = metric.number('facade_wall_area_m2');
  const openings = metric.number('facade_openings_deduction_m2');
  const finishArea = metric.number('facade_finish_area_m2');
  const netArea = Math.max((wallArea || 0) - (openings || 0), 0);

  return {
    key: 'facade',
    title: 'Homlokzat szamitas',
    note: 'A ragaszto, dubel, halo, alapozo es vakolat mennyisegei norma szerinti kozelito ertekek.',
    items: compactItems([
      asItem('Dryvit felulet', netArea, 'm2'),
      asItem('Ragaszto', netArea ? netArea * 5 : 0, 'kg'),
      asItem('Dubel', netArea ? Math.ceil(netArea * 6) : 0, 'db'),
      asItem('Halo', netArea ? netArea * 1.1 : 0, 'm2'),
      asItem('Alapozo', netArea ? netArea * 0.2 : 0, 'liter'),
      asItem('Vakolat', netArea ? netArea * 3 : 0, 'kg'),
      asItem('Szinezo vakolat', finishArea ? finishArea * 3 : 0, 'kg'),
      asItem('Szinezo alapozas', finishArea ? finishArea * 0.2 : 0, 'liter'),
    ]),
  };
}

function buildFloorLayerCalculations(metric: ReturnType<typeof createMetricReader>): TechnicalCalculationGroup {
  const area = metric.number('floor_layer_area_m2');
  const gravel = cmToM(metric.number('floor_gravel_thickness_cm'));
  const leanConcrete = cmToM(metric.number('floor_lean_concrete_thickness_cm'));
  const insulation = cmToM(metric.number('floor_thermal_insulation_thickness_cm'));
  const estrich = cmToM(metric.number('estrich_thickness_cm'));

  return {
    key: 'interior',
    title: 'Aljzat retegrend szamitas',
    note: 'A retegrendi mennyisegek az alapteruletre vetitett kozelito anyagszamok.',
    items: compactItems([
      asItem('Soderagy', area && gravel ? area * gravel : 0, 'm3'),
      asItem('Szerelobeton', area && leanConcrete ? area * leanConcrete : 0, 'm3'),
      asItem('Vizszigeteles / folia', area ? area * 1.1 : 0, 'm2'),
      asItem('Hoszigeteles', area ? area : 0, 'm2'),
      asItem('Hoszigeteles terfogat', area && insulation ? area * insulation : 0, 'm3'),
      asItem('Estrich', area && estrich ? area * estrich : 0, 'm3'),
    ]),
  };
}

function buildHeatingCalculations(metric: ReturnType<typeof createMetricReader>): TechnicalCalculationGroup {
  const area = metric.number('heated_floor_area_m2');
  const spacing = metric.number('underfloor_pipe_spacing_cm');
  const circuits = metric.number('heating_circuit_count');
  const pipeLength = area && spacing ? area * (100 / spacing) * 1.05 : 0;
  const heatPump = area ? area * 0.05 : 0;

  return {
    key: 'mechanical',
    title: 'Padlofutes es hoszivattyu',
    note: 'A hoszivattyu teljesitmeny egyszeru becsles 50 W/m2 fajlagos igeny alapjan.',
    items: compactItems([
      asItem('Padlofutes cso', pipeLength, 'm'),
      asItem('Oszto-gyujto korok', circuits, 'db'),
      asItem('Hoszivattyu becsult teljesitmeny', heatPump, 'kW'),
      asItem('Keringeto szivattyu korok', circuits, 'db'),
    ]),
  };
}

function buildPlumbingCalculations(metric: ReturnType<typeof createMetricReader>): TechnicalCalculationGroup {
  const wetRooms = metric.number('wet_room_count');
  const fixtures = metric.number('fixture_point_count');

  return {
    key: 'mechanical',
    title: 'Vizszereles es csatorna',
    note: 'A csohosszak helyisegszam es kifolyasi pont alapjan becsult mennyisegek.',
    items: compactItems([
      asItem('Hidegvizes cso', wetRooms || fixtures ? wetRooms * 8 + fixtures * 2.5 : 0, 'm'),
      asItem('Melegvizes cso', wetRooms || fixtures ? wetRooms * 6 + fixtures * 1.8 : 0, 'm'),
      asItem('PVC lefolyo', wetRooms || fixtures ? wetRooms * 7 + fixtures * 1.6 : 0, 'm'),
      asItem('Szerelvenyek', fixtures ? fixtures * 2 : 0, 'db'),
    ]),
  };
}

function buildElectricalCalculations(metric: ReturnType<typeof createMetricReader>): TechnicalCalculationGroup {
  const sockets = metric.number('socket_count');
  const switches = metric.number('switch_count');
  const lights = metric.number('luminaire_count');
  const netArea = metric.number('net_floor_area_m2');

  return {
    key: 'electrical',
    title: 'Villanyszereles szamitas',
    note: 'A vezetek- es csovezes mennyisegek alapterulet es szerelvenyszam alapjan becsultek.',
    items: compactItems([
      asItem('Vezetek', sockets || switches || lights ? sockets * 12 + switches * 8 + lights * 6 : 0, 'm'),
      asItem('Csovezes', sockets || switches || lights ? (sockets * 12 + switches * 8 + lights * 6) * 1.05 : 0, 'm'),
      asItem('Szerelvenyek', sockets + switches + lights, 'db'),
      asItem('Biztositektabla korok', netArea ? Math.max(8, Math.ceil(netArea / 18)) : 0, 'db'),
    ]),
  };
}

function buildFinishesCalculations(metric: ReturnType<typeof createMetricReader>): TechnicalCalculationGroup {
  const plasterArea = metric.number('internal_plaster_area_m2');
  const plasterThicknessMm = metric.number('plaster_thickness_mm');
  const paintArea = metric.number('paint_area_m2');
  const paintLayers = metric.number('paint_layers');
  const tileFloor = metric.number('tile_floor_area_m2');
  const tileWall = metric.number('tile_wall_area_m2');
  const tileLength = cmToM(metric.number('tile_length_cm'));
  const tileWidth = cmToM(metric.number('tile_width_cm'));
  const drywall = metric.number('drywall_ceiling_area_m2');

  const tileArea = tileLength && tileWidth ? tileLength * tileWidth : 0;
  const totalTileSurface = (tileFloor || 0) + (tileWall || 0);

  return {
    key: 'interior',
    title: 'Belso befejezo munkak',
    note: 'A vakolat, festek, burkolat es gipszkarton mennyisegek norma szerinti kozelito ertekek.',
    items: compactItems([
      asItem('Vakolat anyag', plasterArea && plasterThicknessMm ? plasterArea * (plasterThicknessMm / 10) * 14 : 0, 'kg'),
      asItem('Festek', paintArea && paintLayers ? (paintArea * paintLayers) / 7 : 0, 'liter'),
      asItem('Burkololap', totalTileSurface && tileArea ? Math.ceil((totalTileSurface / tileArea) * 1.1) : 0, 'db'),
      asItem('Burkolatragaszto', totalTileSurface ? totalTileSurface * 4 : 0, 'kg'),
      asItem('Fugazo', totalTileSurface ? totalTileSurface * 0.35 : 0, 'kg'),
      asItem('Gipszkarton lap', drywall ? Math.ceil((drywall / 3) * 1.1) : 0, 'db'),
      asItem('Gipszkarton profil', drywall ? drywall * 3.2 : 0, 'fm'),
      asItem('Gipszkarton csavar', drywall ? Math.ceil(drywall * 18) : 0, 'db'),
    ]),
  };
}

function buildOpeningsCalculations(metric: ReturnType<typeof createMetricReader>): TechnicalCalculationGroup {
  const windows = metric.number('window_count');
  const doors = metric.number('door_count');
  const perimeter = metric.number('opening_installation_perimeter_m');

  return {
    key: 'openings',
    title: 'Nyilaszaro beepites',
    note: 'A beepitesi anyagok az osszkerulethez igazitott kozelito mennyisegek.',
    items: compactItems([
      asItem('Nyilaszarok osszesen', windows + doors, 'db'),
      asItem('Purhab / beepitesi hab', perimeter ? perimeter * 0.75 : 0, 'flakon'),
      asItem('Pali szalag es tomites', perimeter, 'm'),
      asItem('Rogzitoelemek', perimeter ? Math.ceil(perimeter * 3.5) : 0, 'db'),
    ]),
  };
}

function buildExternalWorksCalculations(metric: ReturnType<typeof createMetricReader>): TechnicalCalculationGroup {
  const paving = metric.number('paving_area_m2');
  const driveway = metric.number('driveway_area_m2');
  const pergola = metric.number('pergola_area_m2');

  return {
    key: 'other',
    title: 'Kulso munkak',
    note: 'A terkoburkolat es a kulso szerkezetek alapmennyisegei.',
    items: compactItems([
      asItem('Terkoburkolat', paving + driveway, 'm2'),
      asItem('Zuzottko alap', paving || driveway ? (paving + driveway) * 0.2 : 0, 'm3'),
      asItem('Terkovek', paving || driveway ? Math.ceil((paving + driveway) * 50) : 0, 'db'),
      asItem('Pergola szerkezeti beton', pergola ? pergola * 0.08 : 0, 'm3'),
    ]),
  };
}

function createMetricReader(parameters: TechnicalParameterValue[]) {
  const map = new Map(parameters.map((parameter) => [parameter.paramKey, parameter]));

  return {
    number(paramKey: string) {
      return map.get(paramKey)?.numberValue || 0;
    },
    text(paramKey: string) {
      return map.get(paramKey)?.textValue || '';
    },
  };
}

function rebarWeight(lengthM: number, diameterMm: number) {
  return lengthM > 0 ? lengthM * ((diameterMm * diameterMm) / 162) : 0;
}

function cmToM(value: number) {
  return value ? value / 100 : 0;
}

function asItem(label: string, value: number, unit: string) {
  if (!value) return null;
  return { label, value: `${formatNumber(value)} ${unit}` };
}

function compactItems(items: Array<{ label: string; value: string } | null>) {
  return items.filter((item): item is { label: string; value: string } => Boolean(item));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('hu-HU', {
    maximumFractionDigits: value < 10 ? 2 : 1,
  }).format(value);
}
