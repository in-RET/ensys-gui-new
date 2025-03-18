import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import * as L from 'leaflet';

@Component({
    selector: 'app-project-create',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
    templateUrl: './project-create.component.html',
    styleUrl: './project-create.component.scss',
})
export class ProjectCreateComponent {
    form: FormGroup = new FormGroup({
        name: new FormControl(null, []),
        description: new FormControl(null, []),
        country: new FormControl('', []),
        latitude: new FormControl('Click on the map', []),
        longitude: new FormControl('Click on the map', []),
        currency: new FormControl('', []),
        unit_choice: new FormControl('', []),
        unit_choice_co2: new FormControl('', []),
    });

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

    ngOnInit() {}

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
}
