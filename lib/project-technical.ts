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

export const technicalSectionLabel: Record<ProjectTechnicalSection, string> = {
  BASICS: 'Alapadatok',
  STRUCTURES: 'Szerkezetek',
  EXTERIOR: 'Kulso elemek',
  INTERIOR: 'Belso munkak',
  MEP: 'Gepeszet es elektromossag',
  SUMMARIES: 'Osszesitok',
  SUBCONTRACTOR_PREP: 'Alvallalkozoi elokeszites',
};

export const technicalFieldDefinitions: TechnicalFieldDefinition[] = [
  {
    section: 'BASICS',
    groupKey: 'site',
    groupLabel: 'Telek es elokeszites',
    groupDescription: 'A projekt alap geometriája, telekadatok és előkészítési körülmények.',
    paramKey: 'lot_area_m2',
    label: 'Telek merete',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 860',
    relatedWorkflows: ['EARTHWORK'],
  },
  {
    section: 'BASICS',
    groupKey: 'site',
    groupLabel: 'Telek es elokeszites',
    groupDescription: 'A projekt alap geometriája, telekadatok és előkészítési körülmények.',
    paramKey: 'gross_floor_area_m2',
    label: 'Brutto alapterulet',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 148',
    relatedWorkflows: ['EARTHWORK', 'MASONRY', 'MECHANICAL', 'ELECTRICAL'],
  },
  {
    section: 'BASICS',
    groupKey: 'site',
    groupLabel: 'Telek es elokeszites',
    groupDescription: 'A projekt alap geometriája, telekadatok és előkészítési körülmények.',
    paramKey: 'level_count',
    label: 'Szintek szama',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 1',
    relatedWorkflows: ['MASONRY', 'MECHANICAL', 'ELECTRICAL'],
  },
  {
    section: 'BASICS',
    groupKey: 'site',
    groupLabel: 'Telek es elokeszites',
    groupDescription: 'A projekt alap geometriája, telekadatok és előkészítési körülmények.',
    paramKey: 'room_count',
    label: 'Helyisegek szama',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 12',
    relatedWorkflows: ['ELECTRICAL', 'MECHANICAL', 'INTERIOR'],
  },
  {
    section: 'BASICS',
    groupKey: 'site',
    groupLabel: 'Telek es elokeszites',
    groupDescription: 'A projekt alap geometriája, telekadatok és előkészítési körülmények.',
    paramKey: 'utilities_ready',
    label: 'Kozmuellatottsag rendezett',
    valueType: 'BOOLEAN',
    input: 'boolean',
    relatedWorkflows: ['EARTHWORK', 'MECHANICAL', 'ELECTRICAL'],
  },
  {
    section: 'BASICS',
    groupKey: 'site',
    groupLabel: 'Telek es elokeszites',
    groupDescription: 'A projekt alap geometriája, telekadatok és előkészítési körülmények.',
    paramKey: 'demolition_required',
    label: 'Bontas szukseges',
    valueType: 'BOOLEAN',
    input: 'boolean',
    relatedWorkflows: ['EARTHWORK'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'foundation',
    groupLabel: 'Alapozas es foldmunka',
    groupDescription: 'Alapozási technológia és mennyiségi kiinduló adatok.',
    paramKey: 'foundation_type',
    label: 'Alapozas tipusa',
    valueType: 'SINGLE_SELECT',
    input: 'select',
    options: [
      { value: 'strip', label: 'Savalap' },
      { value: 'slab', label: 'Lemezalap' },
      { value: 'point', label: 'Pontalap' },
    ],
    relatedWorkflows: ['EARTHWORK'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'foundation',
    groupLabel: 'Alapozas es foldmunka',
    groupDescription: 'Alapozási technológia és mennyiségi kiinduló adatok.',
    paramKey: 'foundation_depth_cm',
    label: 'Alapozasi melyseg',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 90',
    relatedWorkflows: ['EARTHWORK'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'foundation',
    groupLabel: 'Alapozas es foldmunka',
    groupDescription: 'Alapozási technológia és mennyiségi kiinduló adatok.',
    paramKey: 'foundation_concrete',
    label: 'Betonminoseg',
    valueType: 'TEXT',
    input: 'text',
    placeholder: 'pl. C25/30',
    relatedWorkflows: ['EARTHWORK'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'foundation',
    groupLabel: 'Alapozas es foldmunka',
    groupDescription: 'Alapozási technológia és mennyiségi kiinduló adatok.',
    paramKey: 'excavation_volume_m3',
    label: 'Kiemelendo fold mennyiseg',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm3',
    placeholder: 'pl. 68',
    relatedWorkflows: ['EARTHWORK'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'masonry',
    groupLabel: 'Labazat es falazas',
    groupDescription: 'Falazat, nyílások és koszorú alapparaméterek.',
    paramKey: 'main_wall_material',
    label: 'Fofal anyaga',
    valueType: 'SINGLE_SELECT',
    input: 'select',
    options: [
      { value: 'porotherm', label: 'Porotherm' },
      { value: 'ytong', label: 'Ytong' },
      { value: 'concrete', label: 'Zsaluko / beton' },
      { value: 'other', label: 'Egyeb' },
    ],
    relatedWorkflows: ['MASONRY'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'masonry',
    groupLabel: 'Labazat es falazas',
    groupDescription: 'Falazat, nyílások és koszorú alapparaméterek.',
    paramKey: 'main_wall_thickness_cm',
    label: 'Fofal vastagsag',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 30',
    relatedWorkflows: ['MASONRY'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'masonry',
    groupLabel: 'Labazat es falazas',
    groupDescription: 'Falazat, nyílások és koszorú alapparaméterek.',
    paramKey: 'partition_wall_material',
    label: 'Valaszfal anyaga',
    valueType: 'TEXT',
    input: 'text',
    placeholder: 'pl. 10 cm valaszfal tegla',
    relatedWorkflows: ['MASONRY', 'INTERIOR'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'roof',
    groupLabel: 'Fodem es tetoszerkezet',
    groupDescription: 'Födém- és tetőrendszer alapjai a szerkezeti csomagokhoz.',
    paramKey: 'slab_type',
    label: 'Fodem tipusa',
    valueType: 'SINGLE_SELECT',
    input: 'select',
    options: [
      { value: 'monolithic', label: 'Monolit vasbeton' },
      { value: 'beam_block', label: 'Belestestes fodem' },
      { value: 'timber', label: 'Fafodem' },
    ],
    relatedWorkflows: ['ROOFING'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'roof',
    groupLabel: 'Fodem es tetoszerkezet',
    groupDescription: 'Födém- és tetőrendszer alapjai a szerkezeti csomagokhoz.',
    paramKey: 'roof_structure_type',
    label: 'Tetoszerkezet',
    valueType: 'SINGLE_SELECT',
    input: 'select',
    options: [
      { value: 'traditional', label: 'Acsolt teto' },
      { value: 'truss', label: 'Racsostarto' },
      { value: 'other', label: 'Egyeb' },
    ],
    relatedWorkflows: ['ROOFING'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'roof',
    groupLabel: 'Fodem es tetoszerkezet',
    groupDescription: 'Födém- és tetőrendszer alapjai a szerkezeti csomagokhoz.',
    paramKey: 'roof_cover_type',
    label: 'Tetofedes tipusa',
    valueType: 'TEXT',
    input: 'text',
    placeholder: 'pl. beton cserép, antracit',
    relatedWorkflows: ['ROOFING'],
  },
  {
    section: 'STRUCTURES',
    groupKey: 'roof',
    groupLabel: 'Fodem es tetoszerkezet',
    groupDescription: 'Födém- és tetőrendszer alapjai a szerkezeti csomagokhoz.',
    paramKey: 'roof_area_m2',
    label: 'Teto felulete',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 212',
    relatedWorkflows: ['ROOFING'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'insulation',
    groupLabel: 'Szigetelesek',
    groupDescription: 'Homlokzati, padló- és vízszigetelési kiinduló adatok.',
    paramKey: 'facade_insulation_type',
    label: 'Homlokzati hoszigeteles tipusa',
    valueType: 'TEXT',
    input: 'text',
    placeholder: 'pl. EPS grafitos',
    relatedWorkflows: ['FACADE'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'insulation',
    groupLabel: 'Szigetelesek',
    groupDescription: 'Homlokzati, padló- és vízszigetelési kiinduló adatok.',
    paramKey: 'facade_insulation_thickness_cm',
    label: 'Homlokzati vastagsag',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'cm',
    placeholder: 'pl. 15',
    relatedWorkflows: ['FACADE'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'insulation',
    groupLabel: 'Szigetelesek',
    groupDescription: 'Homlokzati, padló- és vízszigetelési kiinduló adatok.',
    paramKey: 'waterproofing_type',
    label: 'Vizszigetelesi rendszer',
    valueType: 'TEXT',
    input: 'text',
    placeholder: 'pl. kent szigeteles + lemez',
    relatedWorkflows: ['EARTHWORK', 'FACADE'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'openings',
    groupLabel: 'Kulso nyilaszarok',
    groupDescription: 'Nyílászárók, árnyékolás és homlokzati kapcsolódások.',
    paramKey: 'window_material',
    label: 'Nyilaszaro anyaga',
    valueType: 'SINGLE_SELECT',
    input: 'select',
    options: [
      { value: 'plastic', label: 'Muanyag' },
      { value: 'aluminium', label: 'Aluminium' },
      { value: 'wood', label: 'Fa' },
    ],
    relatedWorkflows: ['OPENINGS'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'openings',
    groupLabel: 'Kulso nyilaszarok',
    groupDescription: 'Nyílászárók, árnyékolás és homlokzati kapcsolódások.',
    paramKey: 'window_count',
    label: 'Ablakok szama',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 14',
    relatedWorkflows: ['OPENINGS'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'openings',
    groupLabel: 'Kulso nyilaszarok',
    groupDescription: 'Nyílászárók, árnyékolás és homlokzati kapcsolódások.',
    paramKey: 'shading_type',
    label: 'Arnyekolas',
    valueType: 'TEXT',
    input: 'text',
    placeholder: 'pl. motoros redony + szunyoghalo',
    relatedWorkflows: ['OPENINGS', 'ELECTRICAL'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'facade',
    groupLabel: 'Homlokzat es kulso befejezesek',
    groupDescription: 'Homlokzati rendszer és külső befejezések műszaki alapjai.',
    paramKey: 'facade_finish_type',
    label: 'Vakolat / homlokzati rendszer',
    valueType: 'TEXT',
    input: 'text',
    placeholder: 'pl. 1,5 mm kapart vakolat',
    relatedWorkflows: ['FACADE'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'facade',
    groupLabel: 'Homlokzat es kulso befejezesek',
    groupDescription: 'Homlokzati rendszer és külső befejezések műszaki alapjai.',
    paramKey: 'facade_area_m2',
    label: 'Homlokzati felulet',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 196',
    relatedWorkflows: ['FACADE'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'exterior_works',
    groupLabel: 'Kulteri munkak',
    groupDescription: 'Térkő, kerítés és tereprendezés előkészítő adatai.',
    paramKey: 'paved_area_m2',
    label: 'Terkovezett felulet',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 74',
    relatedWorkflows: ['OTHER'],
  },
  {
    section: 'EXTERIOR',
    groupKey: 'exterior_works',
    groupLabel: 'Kulteri munkak',
    groupDescription: 'Térkő, kerítés és tereprendezés előkészítő adatai.',
    paramKey: 'fence_length_m',
    label: 'Kerites hossza',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm',
    placeholder: 'pl. 38',
    relatedWorkflows: ['OTHER'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'interior_finish',
    groupLabel: 'Belso valaszfalak, vakolas, szarazepites',
    groupDescription: 'Vakolás és belső előkészítő munkák alapadatai.',
    paramKey: 'plaster_type',
    label: 'Vakolat tipusa',
    valueType: 'SINGLE_SELECT',
    input: 'select',
    options: [
      { value: 'traditional', label: 'Hagyomanyos' },
      { value: 'machine', label: 'Gepi vakolat' },
      { value: 'drywall', label: 'Gipszkarton rendszer' },
    ],
    relatedWorkflows: ['INTERIOR', 'PAINTING'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'screed',
    groupLabel: 'Aljzatok es esztrich',
    groupDescription: 'Aljzat és rétegrend adatok a burkolási előkészítéshez.',
    paramKey: 'screed_type',
    label: 'Aljzatbeton tipusa',
    valueType: 'TEXT',
    input: 'text',
    placeholder: 'pl. usztatott, padlofutessel',
    relatedWorkflows: ['INTERIOR', 'TILING'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'screed',
    groupLabel: 'Aljzatok es esztrich',
    groupDescription: 'Aljzat és rétegrend adatok a burkolási előkészítéshez.',
    paramKey: 'screed_area_m2',
    label: 'Aljzat felulet',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 132',
    relatedWorkflows: ['INTERIOR', 'TILING'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'tiling',
    groupLabel: 'Burkolasi blokk',
    groupDescription: 'Burkolási felületek és megrendelői döntések alapjai.',
    paramKey: 'tile_area_m2',
    label: 'Burkolando felulet',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 84',
    relatedWorkflows: ['TILING'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'tiling',
    groupLabel: 'Burkolasi blokk',
    groupDescription: 'Burkolási felületek és megrendelői döntések alapjai.',
    paramKey: 'tile_selection_notes',
    label: 'Burkolati valasztasi igenyek',
    valueType: 'TEXT',
    input: 'textarea',
    placeholder: 'pl. furdoben 60x120, teraszon fagyallo csuszasmentes',
    relatedWorkflows: ['TILING'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'painting',
    groupLabel: 'Festesi blokk',
    groupDescription: 'Festési és színválasztási alapadatok.',
    paramKey: 'paint_area_m2',
    label: 'Festendo falfelulet',
    valueType: 'NUMBER',
    input: 'number',
    unit: 'm2',
    placeholder: 'pl. 318',
    relatedWorkflows: ['PAINTING'],
  },
  {
    section: 'INTERIOR',
    groupKey: 'painting',
    groupLabel: 'Festesi blokk',
    groupDescription: 'Festési és színválasztási alapadatok.',
    paramKey: 'paint_color_notes',
    label: 'Szinek / megrendeloi dontesek',
    valueType: 'TEXT',
    input: 'textarea',
    placeholder: 'pl. nappali meleg feher, haloszobak tojastore',
    relatedWorkflows: ['PAINTING'],
  },
  {
    section: 'MEP',
    groupKey: 'electrical',
    groupLabel: 'Villanyszerelesi blokk',
    groupDescription: 'Villamos rendszer, kiállások és okosotthon előkészítés.',
    paramKey: 'power_supply',
    label: 'Aramellatas',
    valueType: 'SINGLE_SELECT',
    input: 'select',
    options: [
      { value: '1_phase', label: 'Egyfazis' },
      { value: '3_phase', label: 'Haromfazis' },
    ],
    relatedWorkflows: ['ELECTRICAL'],
  },
  {
    section: 'MEP',
    groupKey: 'electrical',
    groupLabel: 'Villanyszerelesi blokk',
    groupDescription: 'Villamos rendszer, kiállások és okosotthon előkészítés.',
    paramKey: 'socket_count',
    label: 'Dugaljak szama',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 62',
    relatedWorkflows: ['ELECTRICAL'],
  },
  {
    section: 'MEP',
    groupKey: 'electrical',
    groupLabel: 'Villanyszerelesi blokk',
    groupDescription: 'Villamos rendszer, kiállások és okosotthon előkészítés.',
    paramKey: 'switch_count',
    label: 'Kapcsolok szama',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 31',
    relatedWorkflows: ['ELECTRICAL'],
  },
  {
    section: 'MEP',
    groupKey: 'electrical',
    groupLabel: 'Villanyszerelesi blokk',
    groupDescription: 'Villamos rendszer, kiállások és okosotthon előkészítés.',
    paramKey: 'smart_home_ready',
    label: 'Okosotthon elokeszites',
    valueType: 'BOOLEAN',
    input: 'boolean',
    relatedWorkflows: ['ELECTRICAL'],
  },
  {
    section: 'MEP',
    groupKey: 'mechanical',
    groupLabel: 'Gepeszeti blokk',
    groupDescription: 'Fűtés, HMV és vizes kiállások alapparaméterei.',
    paramKey: 'heating_system',
    label: 'Futesi rendszer',
    valueType: 'TEXT',
    input: 'text',
    placeholder: 'pl. hoszivattyu + padlofutes',
    relatedWorkflows: ['MECHANICAL'],
  },
  {
    section: 'MEP',
    groupKey: 'mechanical',
    groupLabel: 'Gepeszeti blokk',
    groupDescription: 'Fűtés, HMV és vizes kiállások alapparaméterei.',
    paramKey: 'heating_circuit_count',
    label: 'Padlofutesi korok szama',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 11',
    relatedWorkflows: ['MECHANICAL'],
  },
  {
    section: 'MEP',
    groupKey: 'mechanical',
    groupLabel: 'Gepeszeti blokk',
    groupDescription: 'Fűtés, HMV és vizes kiállások alapparaméterei.',
    paramKey: 'wet_room_count',
    label: 'Vizes helyisegek szama',
    valueType: 'NUMBER',
    input: 'number',
    placeholder: 'pl. 3',
    relatedWorkflows: ['MECHANICAL'],
  },
  {
    section: 'SUBCONTRACTOR_PREP',
    groupKey: 'package',
    groupLabel: 'Alvallalkozoi es szerzodeses elokeszites',
    groupDescription: 'Ajánlatkéréshez, szerződéshez és kivitelezési indításhoz szükséges összefoglalók.',
    paramKey: 'contract_scope_summary',
    label: 'Szerzodeses muszaki tartalom',
    valueType: 'TEXT',
    input: 'textarea',
    placeholder: 'Mi szerepeljen biztosan az alvallalkozoi szerzodes muszaki tartalmaban?',
    relatedWorkflows: ['EARTHWORK', 'MASONRY', 'ROOFING', 'FACADE', 'OPENINGS', 'ELECTRICAL', 'MECHANICAL', 'INTERIOR', 'PAINTING', 'TILING', 'OTHER'],
  },
  {
    section: 'SUBCONTRACTOR_PREP',
    groupKey: 'package',
    groupLabel: 'Alvallalkozoi es szerzodeses elokeszites',
    groupDescription: 'Ajánlatkéréshez, szerződéshez és kivitelezési indításhoz szükséges összefoglalók.',
    paramKey: 'quote_request_notes',
    label: 'Ajanlatkeresi megjegyzesek',
    valueType: 'TEXT',
    input: 'textarea',
    placeholder: 'Mit kell elkuldeni, milyen dokumentum kotelezo, milyen hianypotlas varhato?',
    relatedWorkflows: ['EARTHWORK', 'MASONRY', 'ROOFING', 'FACADE', 'OPENINGS', 'ELECTRICAL', 'MECHANICAL', 'INTERIOR', 'PAINTING', 'TILING', 'OTHER'],
  },
  {
    section: 'SUBCONTRACTOR_PREP',
    groupKey: 'package',
    groupLabel: 'Alvallalkozoi es szerzodeses elokeszites',
    groupDescription: 'Ajánlatkéréshez, szerződéshez és kivitelezési indításhoz szükséges összefoglalók.',
    paramKey: 'decision_blockers',
    label: 'Megrendeloi dontesi blokkolok',
    valueType: 'TEXT',
    input: 'textarea',
    placeholder: 'Melyik anyag-, szin- vagy termekvalasztas hianyzik meg?',
    relatedWorkflows: ['OPENINGS', 'FACADE', 'TILING', 'PAINTING', 'ELECTRICAL', 'MECHANICAL'],
  },
];

export const technicalSummaryTemplates: Array<{
  key: string;
  title: string;
  workflow: ProjectWorkflowTemplate;
  relevantParams: string[];
}> = [
  { key: 'earthwork', title: 'Foldmunka es alapozas', workflow: 'EARTHWORK', relevantParams: ['foundation_type', 'foundation_depth_cm', 'foundation_concrete', 'excavation_volume_m3'] },
  { key: 'masonry', title: 'Falazasi csomag', workflow: 'MASONRY', relevantParams: ['main_wall_material', 'main_wall_thickness_cm', 'partition_wall_material'] },
  { key: 'roofing', title: 'Fodem es teto', workflow: 'ROOFING', relevantParams: ['slab_type', 'roof_structure_type', 'roof_cover_type', 'roof_area_m2'] },
  { key: 'openings', title: 'Nyilaszarok', workflow: 'OPENINGS', relevantParams: ['window_material', 'window_count', 'shading_type'] },
  { key: 'electrical', title: 'Villanyszereles', workflow: 'ELECTRICAL', relevantParams: ['power_supply', 'socket_count', 'switch_count', 'smart_home_ready'] },
  { key: 'mechanical', title: 'Gepeszet', workflow: 'MECHANICAL', relevantParams: ['heating_system', 'heating_circuit_count', 'wet_room_count'] },
  { key: 'tiling', title: 'Burkolas', workflow: 'TILING', relevantParams: ['tile_area_m2', 'tile_selection_notes', 'screed_area_m2'] },
  { key: 'painting', title: 'Festes', workflow: 'PAINTING', relevantParams: ['paint_area_m2', 'paint_color_notes', 'plaster_type'] },
  { key: 'facade', title: 'Homlokzat', workflow: 'FACADE', relevantParams: ['facade_insulation_type', 'facade_insulation_thickness_cm', 'facade_finish_type', 'facade_area_m2'] },
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

export function formatTechnicalValue(parameter: {
  textValue: string | null;
  numberValue: number | null;
  booleanValue: boolean | null;
  unit: string | null;
}) {
  if (parameter.numberValue !== null) {
    return `${String(parameter.numberValue)}${parameter.unit ? ` ${parameter.unit}` : ''}`;
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

  return technicalSummaryTemplates.map((summary) => {
    const fields = summary.relevantParams
      .map((paramKey) => technicalFieldDefinitions.find((field) => field.paramKey === paramKey))
      .filter(Boolean);
    const populated = summary.relevantParams
      .map((paramKey) => technicalValueMap.get(paramKey))
      .filter((parameter): parameter is TechnicalParameterValue => Boolean(parameter));

    return {
      ...summary,
      ready: populated.length > 0,
      completion: `${populated.length}/${summary.relevantParams.length}`,
      lines: populated.slice(0, 4).map((parameter) => `${parameter.label}: ${formatTechnicalValue(parameter)}`),
      relatedWorkflow: workflows.find((workflow) => workflow.template === summary.workflow),
      missingCount: fields.length - populated.length,
    };
  });
}

export const workflowDocumentRequirements: Partial<Record<ProjectWorkflowTemplate, WorkflowDocumentRequirement[]>> = {
  FACADE: [
    { key: 'facade_plan', label: 'Homlokzati tervlap', description: 'A munkafolyamathoz tartozó releváns homlokzati terv vagy részletrajz.', required: true },
    { key: 'color_approval', label: 'Szinjovahagyas', description: 'Megrendelő által jóváhagyott szín- vagy mintafelület dokumentáció.', required: true },
    { key: 'scaffold_note', label: 'Allvanyozasi / helyszini jegyzet', description: 'Felvonulási, állványozási vagy kivitelezési induló jegyzet.', required: false },
  ],
  OPENINGS: [
    { key: 'openings_schedule', label: 'Nyilaszarolista', description: 'Darabszám, méret és típuslista a gyártáshoz vagy megrendeléshez.', required: true },
    { key: 'measurement_record', label: 'Meretezesi jegyzokonyv', description: 'Helyszíni felmérés vagy végleges nyílásméret-jegyzőkönyv.', required: true },
    { key: 'shade_selection', label: 'Arnyekolas valasztas', description: 'Redőny / zsalúzia / szúnyogháló jóváhagyás.', required: false },
  ],
  ELECTRICAL: [
    { key: 'electrical_plan', label: 'Villamos terv', description: 'Kapcsolók, dugaljak és kiállások tervlapja vagy összesítője.', required: true },
    { key: 'fixture_decisions', label: 'Szerelveny valasztas', description: 'Megrendelői döntés a kapcsolócsaládról, lámpákról, speciális kiállásokról.', required: false },
  ],
  MECHANICAL: [
    { key: 'mechanical_plan', label: 'Gepeszeti terv', description: 'Padlófűtés, HMV, szellőzés vagy klíma alapdokumentáció.', required: true },
    { key: 'equipment_selection', label: 'Gepeszeti eszkozvalasztas', description: 'Hőszivattyú, szaniterek vagy egyéb gépészeti döntések listája.', required: false },
  ],
  TILING: [
    { key: 'tile_layout', label: 'Burkolatkiosztas', description: 'Burkolási kiosztás, irány vagy helyiségenkénti burkolati lista.', required: true },
    { key: 'tile_selection', label: 'Burkolat valasztas', description: 'Megrendelő által jóváhagyott burkolat- és fugaszín döntések.', required: true },
  ],
  PAINTING: [
    { key: 'paint_selection', label: 'Festek- es szinvalasztas', description: 'Színjóváhagyás vagy helyiségenkénti színlista.', required: true },
    { key: 'surface_note', label: 'Felulelokeszitesi jegyzet', description: 'Javítandó vagy külön kezelendő felületek listája.', required: false },
  ],
};
