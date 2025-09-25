import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import * as L from 'leaflet';
import { map, Observable } from 'rxjs';
import { RegionService } from '../../../shared/services/region.service';
import { ProjectService } from '../services/project.service';


@Component({
    selector: 'app-project-create',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
    templateUrl: './project-create.component.html',
    styleUrl: './project-create.component.scss',
})
export class ProjectCreateComponent implements OnInit {
    form: FormGroup = new FormGroup({
        id: new FormControl(null),
        name: new FormControl(null, [Validators.required]),
        country: new FormControl('', [Validators.required]),
        description: new FormControl(null, [Validators.required]),
        latitude: new FormControl(null, [Validators.required]),
        longitude: new FormControl(null, [Validators.required]),
        currency: new FormControl({
            value: 'EUR',
            disabled: true,
        }, [Validators.required]),
        unit_energy: new FormControl({
            value: 'MW/MWh',
            disabled: true,
        }, [Validators.required]),
        unit_co2: new FormControl({
            value: 't CO2',
            disabled: true
        }, [Validators.required]),
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
        private regionService: RegionService,
        private router: Router
    ) {}

    ngOnInit() {
        this.getRegions();

        if (this.route.snapshot.fragment) {
            if (this.route.snapshot.fragment == 'update') {
                this.mode = 'update';
                this.form.patchValue({
                    id: this.route.snapshot.params['id'],
                });

                this.loadProject(this.route.snapshot.params['id']);
            }
        } else this.initMap(49.45, 13.89);
    }

    getRegions() {
        this.route.data
            .pipe(
                map((res: any) => {
                    return res.regionList;
                })
            )
            .subscribe((res: any) => {
                this.regionList = [];
                this.regionList = res;
            });
    }

    initMap(lat: any, lang: any) {
        const baseMapURl =
            'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';
        this.map = L.map('mapFrame').setView([lat, lang], 5);

        L.tileLayer(baseMapURl, {
            maxZoom: 18,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            accessToken:
                'pk.eyJ1IjoidmFsa2FsYWlzIiwiYSI6ImNrZGhpZ29peTFnMjIycG5ybWR3aG4yeHIifQ.L4y4PQjkIdO1c7pvzOr2kw',
        }).addTo(this.map);

        // this.map.invalidateSize();

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

        this.map.wrapLatLngBounds;
    }

    submitProject() {
        if (this.mode == 'create') {
            const newProject = this.form.getRawValue();

            this.projectService
                .createProject(newProject)
                .pipe(
                    map((res: any) => {
                        if (res.success) return res.data;
                    })
                )

                .subscribe({
                    next: (value) => {
                        this.router.navigate(['projects']);
                    },

                    error: (err) => {
                        console.error(err);
                    },
                });
        } else if (this.mode == 'update') {
            const currentProject = this.form.getRawValue();

            this.projectService
                .updateProject(currentProject)
                .pipe(
                    map((res: any) => {
                        if (res.success) return res.data;
                    })
                )

                .subscribe({
                    next: (value) => {
                        this.router.navigate(['projects']);
                    },

                    error: (err) => {
                        console.error(err);
                    },
                });
        }
    }

    getProjectById(id: number): Observable<any> {
        return this.projectService
            .getProject(id)
            .pipe(
                map((res: any) =>
                    res && res.data.items ? (res = res.data.items[0]) : false
                )
            );
    }

    loadProject(id: number) {
        this.getProjectById(id)
            .pipe(
                map((res: any) => {
                    this.formUpdate(res);
                    this.initMap(res.latitude, res.longitude);
                    this.setMapMarker(res.latitude, res.longitude);
                    return res;
                })
            )
            .subscribe();
    }

    formUpdate(data: any) {
        this.form.patchValue(data);
    }

    setMapMarker(lat: any, lng: any) {
        this.marker = L.marker([lat, lng], this.markerIcon).addTo(this.map);
    }
}
