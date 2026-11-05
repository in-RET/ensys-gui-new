import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    OnDestroy,
    Output,
} from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { DrawflowNode } from 'drawflow';
import { Subscription } from 'rxjs';
import { AlertService } from '../../../../../shared/services/alert.service';
import { FlowData } from '../../../models/node.model';
import { EnergyDesignService } from '../../../services/energy-design.service';
import { ScenarioStateService } from '../../../services/scenario-state.service';
import { ScenarioService } from '../../../services/scenario.service';
import { ModalComponent } from '../../modal/modal.component';

type ConfigurationDepth = 'Quick' | 'Standard' | 'Deep';
type ConfigurationType = 'Local' | 'Global';
type ParameterDistribution = 'Uniform' | 'Normal' | 'Triangular';

interface ConfigurationParameter {
    id: string;
    nodeId: string;
    nodeName: string;
    flowName: string;
    name: string;
    label: string;
    unit: string;
    value: unknown;
    displayValue: string;
    min: number | null;
    max: number | null;
    distribution: ParameterDistribution;
}

interface ScenarioConfiguration {
    id: string;
    name: string;
    depth: ConfigurationDepth;
    type: ConfigurationType;
    monteCarloDistribution: ParameterDistribution;
    defaultMin: number | null;
    defaultMax: number | null;
    parameters: ConfigurationParameter[];
    isDefault: boolean;
    isAnalysisAdvanced: boolean;
}

interface AvailableNodeGroup {
    id: string;
    name: string;
    ports: AvailablePortGroup[];
}

interface AvailablePortGroup {
    id: string;
    name: string;
    parameters: ConfigurationParameter[];
}

interface FlowConnection {
    baseInfo?: {
        input_port?: string;
        output_port?: string;
    };
    formInfo?: FlowData;
}

interface FlowMetadata {
    name?: string;
    label?: string;
    type?: string;
    unit?: string | { text?: string; };
}

interface NodeParameterField {
    name: string;
    label: string;
    value: unknown;
    unit?: string | { text?: string; } | null;
}

interface ScenarioConfigurationModalInfo {
    scenarioId?: number;
    scenarioName?: string;
    defaultId: string;
}

type ParameterRangeForm = FormGroup<{
    min: FormControl<number | null>;
    max: FormControl<number | null>;
}>;

const EXCLUDED_PROPERTIES = new Set(['investment', 'ranges']);
const DISTRIBUTIONS: ParameterDistribution[] = [
    'Uniform',
    'Normal',
    'Triangular',
];

@Component({
    selector: 'app-scenario-configuration-modal',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent],
    templateUrl: './scenario-configuration-modal.component.html',
    styleUrl: './scenario-configuration-modal.component.scss',
})
export class ScenarioConfigurationModalComponent
    implements OnChanges, OnDestroy {
    @Input() modalInfo: ScenarioConfigurationModalInfo | null = null;
    @Output() modalClosed = new EventEmitter<void>();

    private readonly scenarioStateService = inject(ScenarioStateService);
    private readonly energyDesignService = inject(EnergyDesignService);
    private readonly scenarioService = inject(ScenarioService);
    private readonly alertService = inject(AlertService);


    configurations: ScenarioConfiguration[] = [];
    availableNodes: AvailableNodeGroup[] = [];
    activeConfiguration: ScenarioConfiguration | null = null;
    selectedGroups: AvailableNodeGroup[] = [];
    parameterForms: Record<string, ParameterRangeForm> = {};
    availableParameterSelection: Record<string, boolean> = {};
    parameterHasError: Record<string, boolean> = {};
    portHasError: Record<string, boolean> = {};
    nodeHasError: Record<string, boolean> = {};
    warnings: string[] = [];
    isLoading = false;
    storageError = '';
    loadError = '';
    formError = '';
    importError = '';
    readonly depths: ConfigurationDepth[] = ['Quick', 'Standard', 'Deep'];
    readonly distributions = DISTRIBUTIONS;
    private readonly parameterFormSubscriptions: Record<string, Subscription> =
        {};

    ngOnChanges() {
        if (this.modalInfo) {
            this.loadConfigurations();
            void this.loadAvailableParameters();
        }
    }

    get ModalSize(): 'sm' | '' | 'lg' | 'xl' | 'fullscreen' {
        return this.activeConfiguration ? 'xl' : 'lg';
    }

    get ModalTitle(): string {
        if (this.activeConfiguration) {
            return this.activeConfiguration.name;
        }

        return 'Configurations';
    }

    get selectedParameters(): ConfigurationParameter[] {
        return this.activeConfiguration?.parameters ?? [];
    }

    get errorCount(): number {
        return this.selectedParameters.filter(
            (parameter) => this.parameterHasError[parameter.id],
        ).length;
    }

    get warningCount(): number {
        return this.warnings.length;
    }

    get showWorkflow(): boolean {
        return this.selectedParameters.length >= 10 ||
            (this.activeConfiguration?.isAnalysisAdvanced || false);
    }

    get availableGroups(): AvailableNodeGroup[] {
        return this.availableNodes;
    }

    get unselectedParameterCount(): number {

        return this.availableNodes.reduce(
            (total, node) =>
                total +
                node.ports.reduce(
                    (portTotal, port) =>
                        portTotal + this.getUnselectedParameterCount(port),
                    0,
                ),
            0,
        );
    }

    closeModal() {
        this.clearParameterForms();
        this.activeConfiguration = null;
        this.importError = '';
        this.refreshSelectedGroups();
        this.refreshWarnings();
        this.refreshAvailableParameterSelection();
        this.modalClosed.emit();
    }

    newConfiguration() {
        this.clearParameterForms();
        this.formError = '';
        this.importError = '';
        this.activeConfiguration = {
            id: this.createId(),
            name: this.modalInfo?.scenarioName
                ? `Config #${this.configurations.length + 1}`
                : 'New configuration',
            depth: 'Standard',
            type: 'Local',
            monteCarloDistribution: 'Uniform',
            defaultMin: 20,
            defaultMax: 20,
            parameters: [],
            isDefault: false,
            isAnalysisAdvanced: false,
        };
        this.warnings = [];
        this.refreshSelectedGroups();
        this.refreshAvailableParameterSelection();
    }

    editConfiguration(configuration: ScenarioConfiguration) {
        this.clearParameterForms();
        this.formError = '';
        this.importError = '';
        this.activeConfiguration = {
            ...configuration,
            parameters: configuration.parameters.map((parameter) => ({
                ...parameter,
            })),
        };
        for (const parameter of this.activeConfiguration.parameters) {
            this.createParameterForm(parameter);
        }
        this.refreshSelectedGroups();
        this.refreshWarnings();
        this.refreshAvailableParameterSelection();
    }

    setDefaultSimulation(configuration: ScenarioConfiguration) {
        const updated = this.configurations.map(
            (item: ScenarioConfiguration) =>
                item.id == configuration.id ?
                    { ...item, isDefault: true } : { ...item, isDefault: false }
        );
        try {
            this.scenarioService.updateDefaultConfigId(configuration.id);
        } catch (error) {
            console.error(
                'Failed to save the default scenario configuration:',
                error,
            );
            this.storageError =
                'Unable to save the default configuration in this browser session.';
            return;
        }

        if (!this.persistConfigurations(updated)) return;
        this.configurations = updated;
        if (this.modalInfo) {
            this.modalInfo = { ...this.modalInfo, defaultId: configuration.id };
        }
    }

    backToList() {

        this.clearParameterForms();
        this.activeConfiguration = null;
        this.formError = '';
        this.importError = '';
        this.warnings = [];
        this.refreshSelectedGroups();
        this.refreshAvailableParameterSelection();
    }

    addParameter(parameter: ConfigurationParameter) {
        if (!this.activeConfiguration) return;
        if (this.availableParameterSelection[parameter.id]) return;
        const selectedParameter = this.createParameterWithDefaultRange(
            parameter,
            this.activeConfiguration,
        );
        this.activeConfiguration.parameters = [
            ...this.activeConfiguration.parameters,
            selectedParameter,
        ];
        this.createParameterForm(selectedParameter);
        this.refreshSelectedGroups();
        this.refreshWarnings();
        this.refreshAvailableParameterSelection();
    }

    selectAllParameters(current_AnalysisAdvanced?: boolean) {
        const configuration = this.activeConfiguration;
        if (!configuration) return;

        const selectedIds = new Set(
            configuration.parameters.map((parameter) => parameter.id),
        );
        for (const node of this.availableNodes) {
            for (const port of node.ports) {
                for (const parameter of port.parameters) {
                    if (selectedIds.has(parameter.id)) continue;
                    const selectedParameter =
                        this.createParameterWithDefaultRange(
                            parameter,
                            configuration,
                        );
                    configuration.parameters.push(selectedParameter);
                    selectedIds.add(parameter.id);
                    this.createParameterForm(selectedParameter);
                }
            }
        }

        if (current_AnalysisAdvanced != undefined && this.activeConfiguration)
            this.activeConfiguration.isAnalysisAdvanced = !current_AnalysisAdvanced;

        this.refreshSelectedGroups();
        this.refreshWarnings();
        this.refreshAvailableParameterSelection();
    }

    deselectAllParameters(current_AnalysisAdvanced?: boolean) {

        if (!this.activeConfiguration) return;
        this.clearParameterForms();
        this.activeConfiguration.parameters = [];

        if (current_AnalysisAdvanced && this.activeConfiguration)
            this.activeConfiguration.isAnalysisAdvanced = !current_AnalysisAdvanced;

        this.refreshSelectedGroups();
        this.refreshWarnings();
        this.refreshAvailableParameterSelection();
    }

    toggleAnalysisAdvanced(e: Event) {
        const checked = (e.target as HTMLInputElement).checked;

        if (this.activeConfiguration)
            this.activeConfiguration.isAnalysisAdvanced = checked;

        if (checked) {
            this.selectAllParameters();
        } else {
            this.deselectAllParameters();
        }
    }

    getUnselectedParameterCount(port: AvailablePortGroup): number {

        return port.parameters.filter(
            (parameter) => !this.availableParameterSelection[parameter.id],
        ).length;
    }

    private createParameterWithDefaultRange(
        parameter: ConfigurationParameter,
        configuration: ScenarioConfiguration,
    ): ConfigurationParameter {
        const value = this.numericValue(parameter.value);
        const minPercentage = this.numericValue(configuration.defaultMin);
        const maxPercentage = this.numericValue(configuration.defaultMax);

        return {
            ...parameter,
            min:
                value === null || minPercentage === null
                    ? null
                    : value -
                    (Math.abs(value) * Math.max(0, minPercentage)) / 100,
            max:
                value === null || maxPercentage === null
                    ? null
                    : value +
                    (Math.abs(value) * Math.max(0, maxPercentage)) / 100,
            distribution: 'Uniform',
        };
    }

    removeParameter(parameterId: string) {
        if (!this.activeConfiguration) return;
        this.parameterFormSubscriptions[parameterId]?.unsubscribe();
        delete this.parameterFormSubscriptions[parameterId];
        delete this.parameterForms[parameterId];
        this.activeConfiguration.parameters =
            this.activeConfiguration.parameters.filter(
                (parameter) => parameter.id !== parameterId,
            );
        this.refreshSelectedGroups();
        this.refreshWarnings();
        this.refreshAvailableParameterSelection();
    }

    saveConfiguration() {
        const configuration = this.activeConfiguration;
        if (!configuration) return;
        this.syncConfigurationBounds();
        if (!configuration.name.trim()) {
            this.formError = 'Enter a configuration name before saving.';
            return;
        }

        const updated = [...this.configurations];
        const index = updated.findIndex(
            (saved) => saved.id === configuration.id,
        );
        if (index >= 0) updated[index] = configuration;
        else updated.push(configuration);

        if (this.persistConfigurations(updated)) {
            this.configurations = updated;
            this.backToList();
        }
    }

    async deleteConfiguration(configurationId: string) {
        if (
            await this.alertService.confirm(
                'Are you sure to delete this item?',
                'Delete',
                undefined,
                undefined,
                'error',
            )
        ) {
            const isDefault = this.modalInfo?.defaultId === configurationId;
            if (isDefault) {
                try {
                    this.scenarioService.updateDefaultConfigId(null);
                } catch (error) {
                    console.error(
                        'Failed to clear the default scenario configuration:',
                        error,
                    );
                    this.storageError =
                        'Unable to update the default configuration in this browser session.';
                    return;
                }
            }

            const updated = this.configurations.filter(
                (configuration) => configuration.id !== configurationId,
            );
            if (this.persistConfigurations(updated)) {
                this.configurations = updated;
                if (isDefault && this.modalInfo) {
                    this.modalInfo = { ...this.modalInfo, defaultId: '' };
                }
            }
        }
    }

    async duplicateConfiguration(configuration: ScenarioConfiguration) {
        if (
            await this.alertService.confirm(
                `Are you sure you want to duplicate ${configuration.name}?`,
                'Duplicate',
            )) {
            const baseName = `${configuration.name}-copy`;
            const existingNames = new Set(
                this.configurations.map(({ name }) => name.toLowerCase()),
            );
            let name = baseName;
            let suffix = 2;
            while (existingNames.has(name.toLowerCase())) {
                name = `${baseName}-${suffix++}`;
            }

            let id = this.createId();
            while (this.configurations.some((item) => item.id === id)) {
                id = this.createId();
            }

            const duplicate: ScenarioConfiguration = {
                ...configuration,
                id,
                name,
                parameters: configuration.parameters.map((parameter) => ({
                    ...parameter,
                })),
                isDefault: false,
            };
            const updated = [...this.configurations, duplicate];
            if (this.persistConfigurations(updated)) {
                this.configurations = updated;
            }
        }
    }

    exportAllConfigurations() {
        this.downloadJson(this.configurations, 'configurations.json');
    }

    exportConfiguration(configuration: ScenarioConfiguration) {
        this.downloadJson(
            configuration,
            `configuration-${this.fileNamePart(configuration.name)}.json`,
        );
    }

    exportActiveConfiguration() {
        if (!this.activeConfiguration) return;
        this.syncConfigurationBounds();
        this.exportConfiguration(this.activeConfiguration);
    }

    importConfigurationFile(event: Event, destination: 'list' | 'editor') {
        const input = event.target;
        if (!(input instanceof HTMLInputElement)) return;

        const file = input.files?.[0];
        input.value = '';
        if (!file) return;

        this.importError = '';
        if (!/\.json$/i.test(file.name)) {
            this.importError = 'Select a JSON file to import.';
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                this.importError = 'Unable to read the selected JSON file.';
                return;
            }

            let imported: unknown;
            try {
                imported = JSON.parse(reader.result);
            } catch (error) {
                console.error('Failed to import scenario configurations:', error);
                this.importError =
                    'The selected file is not valid configuration JSON.';
                return;
            }

            if (destination === 'editor') {
                this.importIntoActiveConfiguration(imported);
            } else {
                this.importIntoConfigurationList(imported);
            }
        };
        reader.onerror = () => {
            console.error(
                'Failed to read the selected configuration file:',
                reader.error,
            );
            this.importError = 'Unable to read the selected JSON file.';
        };

        try {
            reader.readAsText(file);
        } catch (error) {
            console.error('Failed to read the selected configuration file:', error);
            this.importError = 'Unable to read the selected JSON file.';
        }
    }

    private importIntoConfigurationList(data: unknown) {
        const source = Array.isArray(data) ? data : [data];
        const imported = source.map((item) =>
            this.normalizeImportedConfiguration(item),
        );
        if (!imported.length || imported.some((configuration) => !configuration)) {
            this.importError =
                'The JSON file must contain one configuration or an array of configurations.';
            return;
        }

        const ids = new Set(this.configurations.map(({ id }) => id));
        const configurations = imported
            .filter(
                (configuration): configuration is ScenarioConfiguration =>
                    configuration !== null,
            )
            .map((candidate) => {
                while (ids.has(candidate.id)) {
                    candidate.id = this.createId();
                }
                ids.add(candidate.id);
                return candidate;
            });
        const updated = [...this.configurations, ...configurations];

        if (this.persistConfigurations(updated)) {
            this.configurations = updated;
            this.importError = '';
        }
    }

    private importIntoActiveConfiguration(data: unknown) {
        const configuration = this.normalizeImportedConfiguration(data);
        if (!configuration) {
            this.importError = 'The JSON file does not contain a valid configuration.';
            return;
        }
        if (!this.activeConfiguration) return;

        configuration.id = this.activeConfiguration.id;
        configuration.isDefault = this.activeConfiguration.isDefault;
        this.activeConfiguration = configuration;
        this.clearParameterForms();
        for (const parameter of configuration.parameters) {
            this.createParameterForm(parameter);
        }
        this.refreshSelectedGroups();
        this.refreshWarnings();
        this.refreshAvailableParameterSelection();
        this.formError = '';
        this.importError = '';
    }

    private normalizeImportedConfiguration(
        value: unknown,
    ): ScenarioConfiguration | null {
        if (!this.isRecord(value)) return null;
        const id = value['id'];
        const name = value['name'];
        const depth = value['depth'];
        const type = value['type'];
        const monteCarloDistribution = value['monteCarloDistribution'];
        const sourceParameters = value['parameters'];
        if (
            typeof id !== 'string' ||
            !id.trim() ||
            typeof name !== 'string' ||
            !this.isConfigurationDepth(depth) ||
            !this.isConfigurationType(type) ||
            !this.isDistribution(monteCarloDistribution) ||
            !Array.isArray(sourceParameters)
        ) {
            return null;
        }

        const parameters = sourceParameters.filter(
            (parameter): parameter is ConfigurationParameter =>
                this.isConfigurationParameter(parameter),
        );
        if (parameters.length !== sourceParameters.length) return null;

        const defaultMin =
            value['defaultMin'] === undefined ? 20 : value['defaultMin'];
        const defaultMax =
            value['defaultMax'] === undefined ? 20 : value['defaultMax'];
        if (!this.isRangeValue(defaultMin) || !this.isRangeValue(defaultMax)) {
            return null;
        }
        const isAnalysisAdvanced = value['isAnalysisAdvanced'];
        if (
            isAnalysisAdvanced !== undefined &&
            typeof isAnalysisAdvanced !== 'boolean'
        ) {
            return null;
        }

        return {
            id,
            name,
            depth,
            type,
            monteCarloDistribution,
            defaultMin,
            defaultMax,
            parameters: parameters.map((parameter) => ({
                id: parameter.id,
                nodeId: parameter.nodeId,
                nodeName: parameter.nodeName,
                flowName: parameter.flowName,
                name: parameter.name,
                label: parameter.label,
                unit: parameter.unit,
                value: parameter.value,
                displayValue: parameter.displayValue,
                min: parameter.min,
                max: parameter.max,
                distribution: parameter.distribution,
            })),
            isDefault: false,
            isAnalysisAdvanced: isAnalysisAdvanced === true,
        };
    }

    private isConfigurationParameter(
        value: unknown,
    ): value is ConfigurationParameter {
        if (!this.isRecord(value)) return false;
        const id = value['id'];
        const nodeId = value['nodeId'];
        const nodeName = value['nodeName'];
        const flowName = value['flowName'];
        const name = value['name'];
        const label = value['label'];
        const unit = value['unit'];
        const displayValue = value['displayValue'];
        const min = value['min'];
        const max = value['max'];
        const distribution = value['distribution'];
        return (
            typeof id === 'string' &&
            typeof nodeId === 'string' &&
            typeof nodeName === 'string' &&
            typeof flowName === 'string' &&
            typeof name === 'string' &&
            typeof label === 'string' &&
            typeof unit === 'string' &&
            typeof displayValue === 'string' &&
            'value' in value &&
            this.isRangeValue(min) &&
            this.isRangeValue(max) &&
            this.isDistribution(distribution)
        );
    }

    private isRecord(value: unknown): value is Record<string, unknown> {
        return (
            typeof value === 'object' && value !== null && !Array.isArray(value)
        );
    }

    private isRangeValue(value: unknown): value is number | null {
        return (
            value === null ||
            (typeof value === 'number' && Number.isFinite(value))
        );
    }

    private isConfigurationDepth(value: unknown): value is ConfigurationDepth {
        return value === 'Quick' || value === 'Standard' || value === 'Deep';
    }

    private isConfigurationType(value: unknown): value is ConfigurationType {
        return value === 'Local' || value === 'Global';
    }

    private isDistribution(value: unknown): value is ParameterDistribution {
        return DISTRIBUTIONS.some((distribution) => distribution === value);
    }

    private downloadJson(data: unknown, fileName: string) {
        const file = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    }

    private fileNamePart(value: string): string {
        return value.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '') ||
            'configuration';
    }

    trackByNode(_index: number, group: AvailableNodeGroup): string {
        return group.id;
    }

    trackByParameter(
        _index: number,
        parameter: ConfigurationParameter,
    ): string {
        return parameter.id;
    }

    ngOnDestroy() {
        this.clearParameterForms();
    }

    private async loadAvailableParameters() {
        this.isLoading = true;
        this.loadError = '';
        this.availableNodes = [];

        const modelingData =
            this.scenarioStateService.getScenarioData()?.scenario
                ?.modeling_data;
        if (!modelingData || typeof modelingData !== 'object') {
            this.isLoading = false;
            this.loadError = 'No scenario node data is available.';
            return;
        }

        try {
            const groups: AvailableNodeGroup[] = [];
            for (const node of Object.values(modelingData) as DrawflowNode[]) {
                const nodeType = String(
                    node.data?.type ?? node.class?.split(' ')[0] ?? '',
                );
                if (nodeType.toLowerCase() === 'bus') continue;

                const nodeParameters: ConfigurationParameter[] = [];
                if (nodeType.toLowerCase() === 'genericstorage') {
                    nodeParameters.push(
                        ...this.getStorageNodeParameters(node),
                    );
                }

                const connections = node.data?.connections;
                const directions: Array<{
                    name: 'inputs' | 'outputs';
                    connections: FlowConnection[];
                }> = [
                        {
                            name: 'inputs',
                            connections: connections?.inputs ?? [],
                        },
                        {
                            name: 'outputs',
                            connections: connections?.outputs ?? [],
                        },
                    ];

                for (const direction of directions) {
                    for (const [
                        index,
                        connection,
                    ] of direction.connections.entries()) {
                        const formInfo = connection.formInfo;
                        if (!formInfo) continue;

                        const form =
                            await this.energyDesignService.getFormFields_flow(
                                nodeType,
                                true,
                                Boolean(node.data?.oep),
                                formInfo,
                            );
                        const metadata = this.getFieldMetadata(form);

                        const port =
                            direction.name === 'inputs'
                                ? connection.baseInfo?.input_port
                                : connection.baseInfo?.output_port;
                        const flowName =
                            port ||
                            `${direction.name.slice(0, -1)} ${index + 1}`;

                        for (const [name, value] of Object.entries(formInfo)) {
                            if (EXCLUDED_PROPERTIES.has(name)) continue;

                            const fieldMetadata = metadata.get(
                                name.toLowerCase(),
                            );

                            const modelValue =
                                fieldMetadata?.type === 'time-series' &&
                                    Array.isArray(value)
                                    ? this.sumNumericArray(value, name.toLowerCase())
                                    : value;
                            const label =
                                fieldMetadata?.label || this.titleCase(name);
                            const unit = fieldMetadata?.unit;
                            nodeParameters.push({
                                id: `${node.id}:${direction.name}:${index}:${name}`,
                                nodeId: String(node.id),
                                nodeName: node.name || `Node ${node.id}`,
                                flowName,
                                name,
                                label,
                                unit:
                                    typeof unit === 'string'
                                        ? unit
                                        : unit?.text || '',
                                value: modelValue,
                                displayValue:
                                    this.formatDisplayValue(modelValue),
                                min: null,
                                max: null,
                                distribution: 'Uniform',
                            });
                        }
                    }
                }

                if (nodeParameters.length) {
                    groups.push(...this.groupParameters(nodeParameters));
                }
            }
            this.availableNodes = groups;
            this.refreshAvailableParameterSelection();
        } catch (error) {
            console.error(
                'Failed to load scenario configuration fields:',
                error,
            );
            this.loadError =
                'Unable to load the scenario flow fields. Close and reopen the modal to try again.';
        } finally {
            this.isLoading = false;
        }
    }

    private getStorageNodeParameters(
        node: DrawflowNode,
    ): ConfigurationParameter[] {
        const fields: NodeParameterField[] = [
            {
                name: 'nominal_storage_capacity',
                label: 'Nominal Storage Capacity',
                value: node.data?.nominal_storage_capacity,
            },
            ...this.energyDesignService.getInvestmentFields_storage(
                node.data,
            ),
            ...this.energyDesignService.getDefaultFields_storage(node.data),
        ];

        return fields
            .filter((field) => this.numericValue(field.value) !== null)
            .map((field) => ({
                id: `${node.id}:node:${field.name}`,
                nodeId: String(node.id),
                nodeName: node.name || `Node ${node.id}`,
                flowName: 'Storage Parameters',
                name: field.name,
                label: field.label,
                unit:
                    typeof field.unit === 'string'
                        ? field.unit
                        : field.unit?.text || '',
                value: field.value,
                displayValue: this.formatDisplayValue(field.value),
                min: null,
                max: null,
                distribution: 'Uniform',
            }));
    }

    private getFieldMetadata(form: unknown): Map<string, FlowMetadata> {
        const metadata = new Map<string, FlowMetadata>();
        if (!form || typeof form !== 'object' || !('sections' in form)) {
            return metadata;
        }

        const sections = (
            form as { sections?: Array<{ fields?: FlowMetadata[]; }>; }
        ).sections;
        for (const section of sections ?? []) {
            for (const field of section.fields ?? []) {
                if (field.name) metadata.set(field.name.toLowerCase(), field);
            }
        }
        return metadata;
    }

    private groupParameters(
        parameters: ConfigurationParameter[],
    ): AvailableNodeGroup[] {
        const groups = new Map<string, AvailableNodeGroup>();
        for (const parameter of parameters) {
            let group = groups.get(parameter.nodeId);
            if (!group) {
                group = {
                    id: parameter.nodeId,
                    name: parameter.nodeName,
                    ports: [],
                };
                groups.set(parameter.nodeId, group);
            }

            let port = group.ports.find(
                (item) => item.name === parameter.flowName,
            );
            if (!port) {
                port = {
                    id: `${parameter.nodeId}:${parameter.flowName}`,
                    name: parameter.flowName,
                    parameters: [],
                };
                group.ports.push(port);
            }



            if (parameter.value !== null && parameter.value !== undefined && ['number', 'string'].includes(typeof (parameter.value)))
                port.parameters.push(parameter);
        }
        return Array.from(groups.values());
    }



    private sumNumericArray(value: unknown, fieldName: string): unknown {
        function isNumericArray(value: unknown): value is number[] {
            return (
                Array.isArray(value) &&
                value.length > 0 &&
                value.every(
                    (item: unknown) =>
                        typeof item === 'number' && Number.isFinite(item),
                )
            );
        }

        if (!isNumericArray(value)) {
            return value == null ? '' : String(value);
        }
        const total = value.reduce((sum, item) => sum + item, 0);
        if (fieldName.includes('cost'))
            return String(Math.round((total / value.length) * 100) / 100);
        else return String(Math.round(total * 100) / 100);


    }

    private createParameterForm(parameter: ConfigurationParameter) {
        const minControl = new FormControl<number | null>(parameter.min, [
            Validators.required,
        ]);
        const maxControl = new FormControl<number | null>(parameter.max, [
            Validators.required,
        ]);
        minControl.addValidators(
            this.boundValidator('min', maxControl, parameter.value),
        );
        maxControl.addValidators(
            this.boundValidator('max', minControl, parameter.value),
        );
        minControl.updateValueAndValidity({
            onlySelf: true,
            emitEvent: false,
        });
        maxControl.updateValueAndValidity({
            onlySelf: true,
            emitEvent: false,
        });

        const rangeForm = new FormGroup({
            min: minControl,
            max: maxControl,
        });
        this.parameterForms[parameter.id] = rangeForm;
        this.parameterFormSubscriptions[parameter.id] =
            rangeForm.valueChanges.subscribe(() => {
                minControl.updateValueAndValidity({
                    onlySelf: true,
                    emitEvent: false,
                });
                maxControl.updateValueAndValidity({
                    onlySelf: true,
                    emitEvent: false,
                });
                rangeForm.updateValueAndValidity({ emitEvent: false });
                this.refreshWarnings();
            });
    }

    private boundValidator(
        bound: 'min' | 'max',
        oppositeControl: FormControl<number | null>,
        modelValue: unknown,
    ): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const boundValue = this.numericValue(control.value);
            const oppositeValue = this.numericValue(oppositeControl.value);
            const min = bound === 'min' ? boundValue : oppositeValue;
            const max = bound === 'max' ? boundValue : oppositeValue;
            const value = this.numericValue(modelValue);
            const errors: ValidationErrors = {};

            if (min !== null && max !== null && min > max) {
                errors['minGreaterThanMax'] = true;
            }
            if (
                bound === 'min' &&
                value !== null &&
                min !== null &&
                value < min
            ) {
                errors['modelBelowMin'] = true;
            }
            if (
                bound === 'max' &&
                value !== null &&
                max !== null &&
                value > max
            ) {
                errors['modelAboveMax'] = true;
            }
            return Object.keys(errors).length ? errors : null;
        };
    }

    private refreshWarnings() {
        if (!this.activeConfiguration) {
            this.warnings = [];
            this.parameterHasError = {};
            this.portHasError = {};
            this.nodeHasError = {};
            return;
        }

        const warnings: string[] = [];
        const parameterHasError: Record<string, boolean> = {};
        const portHasError: Record<string, boolean> = {};
        const nodeHasError: Record<string, boolean> = {};
        for (const parameter of this.activeConfiguration.parameters) {
            const rangeForm = this.parameterForms[parameter.id];
            if (!rangeForm) continue;

            const minErrors = rangeForm.controls.min.errors;
            const maxErrors = rangeForm.controls.max.errors;
            const hasError = !!minErrors || !!maxErrors;
            parameterHasError[parameter.id] = hasError;
            const portKey = `${parameter.nodeId}:${parameter.flowName}`;
            if (hasError) {
                portHasError[portKey] = true;
                nodeHasError[parameter.nodeId] = true;
            }

            if (rangeForm.controls.min.errors?.['required']) {
                warnings.push(
                    `${parameter.nodeName} > ${parameter.flowName} > ${parameter.label}: minimum is required.`,
                );
            }
            if (rangeForm.controls.max.errors?.['required']) {
                warnings.push(
                    `${parameter.nodeName} > ${parameter.flowName} > ${parameter.label}: maximum is required.`,
                );
            }
            if (
                rangeForm.controls.min.errors?.['minGreaterThanMax'] ||
                rangeForm.controls.max.errors?.['minGreaterThanMax']
            ) {
                warnings.push(
                    `${parameter.nodeName} > ${parameter.flowName} > ${parameter.label}: minimum exceeds maximum.`,
                );
            }
            if (rangeForm.controls.min.errors?.['modelBelowMin']) {
                warnings.push(
                    `${parameter.nodeName} > ${parameter.flowName} > ${parameter.label}: model value is below minimum.`,
                );
            }
            if (rangeForm.controls.max.errors?.['modelAboveMax']) {
                warnings.push(
                    `${parameter.nodeName} > ${parameter.flowName} > ${parameter.label}: model value is above maximum.`,
                );
            }
        }
        this.warnings = warnings;
        this.parameterHasError = parameterHasError;
        this.portHasError = portHasError;
        this.nodeHasError = nodeHasError;
    }

    private refreshSelectedGroups() {
        this.selectedGroups = this.groupParameters(this.selectedParameters);
    }

    private refreshAvailableParameterSelection() {
        const selectedIds = new Set(
            this.selectedParameters.map((parameter) => parameter.id),
        );
        const selection: Record<string, boolean> = {};
        for (const node of this.availableNodes) {
            for (const port of node.ports) {
                for (const parameter of port.parameters) {
                    selection[parameter.id] = selectedIds.has(parameter.id);
                }
            }
        }
        this.availableParameterSelection = selection;
    }

    private syncConfigurationBounds() {
        for (const parameter of this.selectedParameters) {
            const value = this.parameterForms[parameter.id]?.getRawValue();
            if (!value) continue;
            parameter.min = value.min;
            parameter.max = value.max;
        }
    }

    private clearParameterForms() {
        for (const subscription of Object.values(
            this.parameterFormSubscriptions,
        )) {
            subscription.unsubscribe();
        }
        for (const id of Object.keys(this.parameterFormSubscriptions)) {
            delete this.parameterFormSubscriptions[id];
        }
        this.parameterForms = {};
    }

    private loadConfigurations() {
        this.storageError = '';
        try {
            const stored = sessionStorage.getItem(this.storageKey());
            if (!stored) {
                this.configurations = [];
                return;
            }
            const parsed: unknown = JSON.parse(stored);
            if (
                !Array.isArray(parsed) ||
                !parsed.every(
                    (item) =>
                        item &&
                        typeof item.id === 'string' &&
                        typeof item.name === 'string' &&
                        Array.isArray(item.parameters),
                )
            ) {
                throw new Error(
                    'Stored scenario configurations have an invalid format.',
                );
            }
            this.configurations = (parsed as ScenarioConfiguration[]).map(
                (configuration) => ({
                    ...configuration,
                    defaultMin:
                        configuration.defaultMin === undefined
                            ? 20
                            : configuration.defaultMin,
                    defaultMax:
                        configuration.defaultMax === undefined
                            ? 20
                            : configuration.defaultMax,
                    isDefault:
                        configuration.id === this.modalInfo?.defaultId,
                }),
            );
        } catch (error) {
            console.error('Failed to read scenario configurations:', error);
            this.storageError =
                'Unable to read saved configurations from this browser session.';
            this.configurations = [];
        }
    }

    private persistConfigurations(
        configurations: ScenarioConfiguration[],
    ): boolean {
        try {
            sessionStorage.setItem(
                this.storageKey(),
                JSON.stringify(configurations),
            );
            this.storageError = '';
            return true;
        } catch (error) {
            console.error('Failed to save scenario configurations:', error);
            this.storageError =
                'Unable to save configurations in this browser session.';
            return false;
        }
    }

    private storageKey(): string {
        const scenario = this.scenarioStateService.getScenarioData()?.scenario;
        const scenarioKey =
            this.modalInfo?.scenarioId ??
            scenario?.id ??
            scenario?.name ??
            'current';
        return `scenario-configurations:${scenarioKey}`;
    }

    private numericValue(value: unknown): number | null {
        if (typeof value !== 'number' && typeof value !== 'string') return null;
        if (typeof value === 'string' && !value.trim()) return null;
        const normalized =
            typeof value === 'string' ? value.replace(',', '.') : value;
        const number = Number(normalized);
        return Number.isFinite(number) ? number : null;
    }

    private titleCase(value: string): string {
        return value
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    }

    private formatDisplayValue(value: unknown): string {
        if (value === null || value === undefined) return '—';

        if (typeof value === 'object')
            return JSON.stringify(value) ?? String(value);

        return String(value);
    }

    private createId(): string {
        return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
}
