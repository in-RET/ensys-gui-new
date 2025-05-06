import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import * as L from 'leaflet';
import { RegionService } from '../../../shared/services/region.service';
import { ProjectService } from '../services/project.service';

@Component({
    selector: 'app-project-create',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
    templateUrl: './project-create.component.html',
    styleUrl: './project-create.component.scss',
})
export class ProjectCreateComponent {
    form: FormGroup = new FormGroup({
        name: new FormControl(null, [Validators.required]),
        country: new FormControl('', [Validators.required]),
        description: new FormControl(null, [Validators.required]),
        latitude: new FormControl(null, [Validators.required]),
        longitude: new FormControl(null, [Validators.required]),
        currency: new FormControl('', [Validators.required]),
        unit_energy: new FormControl('', [Validators.required]),
        unit_co2: new FormControl('', [Validators.required]),
    });

    get name() {
        return this.form.get('name');
    }

    get country() {
        return this.form.get('country');
    }

    get description() {
        return this.form.get('description');
    }

    get latitude() {
        return this.form.get('latitude');
    }

    get longitude() {
        return this.form.get('longitude');
    }

    get currency() {
        return this.form.get('currency');
    }

    get unit_energy() {
        return this.form.get('unit_energy');
    }

    get unit_co2() {
        return this.form.get('unit_co2');
    }

    private map!: L.Map;
    marker!: L.Marker;

    markerIcon = {
        icon: L.icon({
            iconSize: [25, 41],
            iconAnchor: [10, 41],
            popupAnchor: [2, -40],
            iconUrl:
                'https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png',
            shadowUrl:
                'https://unpkg.com/leaflet@1.5.1/dist/images/marker-shadow.png',
        }),
    };

    // if update item
    mode: 'create' | 'update' | '' = 'create';

    regionList!: any[];

    constructor(
        private projectService: ProjectService,
        private route: ActivatedRoute,
        private regionService: RegionService
    ) {}

    ngOnInit() {
        // getv regions
        this.regionService.getAllRegions().subscribe((res) => {
            console.log(res[0].name);

            this.regionList = res;
        });

        if (this.route.snapshot.fragment) {
            if (this.route.snapshot.fragment == 'update') {
                this.mode = 'update';
                this.getProjectData(this.route.snapshot.params['id']);
            }
        }
    }

    ngAfterViewInit() {
        this.initMap();

        setTimeout(() => {
            this.map.invalidateSize();
        }, 100);

        this.map.on('click', (e: any) => {
            if (this.marker) this.map.removeLayer(this.marker);

            this.marker = L.marker(
                [e.latlng.lat, e.latlng.lng],
                this.markerIcon
            ).addTo(this.map);

            this.form.patchValue({
                latitude: e.latlng.lat.toFixed(6),
                longitude: e.latlng.lng.toFixed(6),
            });
        });
    }

    private initMap() {
        const baseMapURl =
            'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';
        this.map = L.map('mapFrame').setView([49.45, 13.89], 4);
        L.tileLayer(baseMapURl, {
            maxZoom: 18,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken:
                'pk.eyJ1IjoidmFsa2FsYWlzIiwiYSI6ImNrZGhpZ29peTFnMjIycG5ybWR3aG4yeHIifQ.L4y4PQjkIdO1c7pvzOr2kw',
        }).addTo(this.map);
    }

    submitProject() {
        let newProject = this.form.getRawValue();

        this.projectService.createProject(newProject).subscribe({
            next: (value) => {
                console.log(value);
            },

            error: (err) => {
                console.error(err);
            },
        });
    }

    getProjectData(id: number) {
        this.projectService.getProject(id).subscribe({
            next(value) {},
            error(err) {},
        });
    }
}
