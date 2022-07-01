import React, { useEffect, useState }  from 'react'
import Select from 'react-select'
import './dropdown.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './checkbox.css';
import {
  SearchItemsContainer,
} from './GallerySectionElements';

const SearchItems = (props) => {
    const [setting, setSetting] = useState([]);
    const [paper, setPaper] = useState([]);
    const [coloring, setColoring] = useState([]);
    const [font, setFont] = useState([]);
    const [location, setLocation] = useState([]);
    const [special, setSpecial] = useState([]);

    const settingList = ['Benjamins', 'Calacatta Marble', 'Central Park', 'Connemara Marble', 'Dark Alley', 'Dissection', 'Dorsia Club', 'Great Outdoors', 'Kashmir Silk', 'Office Table', 'Old Growth', 'Resin River', 'Self Defense', 'VHS Static']
    const paperList = ['Business Premium', 'Capital Grade', 'Imperial Print', 'Leather Marked', 'Misty Press', 'Mountain Craft', 'Rail Stamped', 'Recycled Note', 'Standard American', 'Unpresentable']
    const coloringList = ['Bone', 'Eggshell', 'Glacier', 'Ivory', 'White']
    const fontList = ['Babylon Script', 'Bookman Type', 'Century Block', 'Dorsian Sea', 'Esoteric Antiqua', 'Pale Nimbus', 'Port Carruthers', 'Romalian Type', 'Royal Script', 'Silian Rail']
    const locationList = ['Apartment', 'Cemetery', 'Dorsia', 'Forty Fifth', 'Golden Bullrun', 'Homeless', 'Marina', 'Mergers and Acquisitions', 'The Center', "Tom's Restaurant"]
    const specialList = ['Cranberry juice', 'Defaced', 'Footprint', 'Focused shadow', 'Gold edges', 'Gold lettering', 'Menacing shadow', 'Silver lettering', 'Washed', 'Watermark', '*NONE']

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            marginRight: '10px',
            marginBottom: '10px',
            width: '175px',
            backgroundColor: 'var(--light-background)',
            color: 'red',
            border: '1px solid var(--main-text)',
            boxShadow: 'none',
            '&:hover': {
                border: '1px solid var(--highlighted-text)'
            }
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: 'var(--main-text)'
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: 'var(--main-text)'
            
        }),
        container: (provided, state) => ({
            ...provided,
            /* width: '200px', */
            color: 'var(--main-text)', // E6C229
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: 'var(--light-background)',
            padding: 20,
            color: state.isSelected ? 'var(--button)' : 'var(--main-text)',
            '&:hover': {
                backgroundColor: 'var(--light-background-2)'
            },
        }),
        menuList: (provided, state) => ({
            ...provided,
            padding: 0,
            backgroundColor: 'var(--light-background)',
        }),
        
    }

    const listToOptions = (list) => {
        let options = []
        for (let i = 0; i < list.length; i++) {
            options.push({value: list[i], label: list[i]})
        }
        return options
    }

    const cleanOptions = (list) => {
        let options = []
        for (let i = 0; i < list.length; i++) {
            options.push(list[i]['label'])
        }
        return options
    }

    // On updating one of the search requirements, generates a new toSearch with the attributes to look for
    useEffect(() => {
        // Way this would be used: on looping through the total cards, we check its attributes as this:
        // For PAPER, is its value CONTAINED in the toSearch entry for Paper (which is an array), ie, is the Paper value in the array? if yes show, if no discard
        // For any of the specials: is any of the other attribute PAIRS in the array for Special?
        //
        // The metadata pairs are as: {"trait_type": "Something special", "value": "Value"/null}
        // We can loop through these remaining pairs (after processing Setting - Location) and check if they are present in the array from the toSearch entry for special
        // We could also check the other way around, so we are able to look for tokens that have Gold edges AND Gold lettering, not with Gold edges OR Gold lettering

        var toSearch =  {};

        toSearch['Setting'] = cleanOptions(setting);
        toSearch['Paper'] = cleanOptions(paper);
        toSearch['Coloring'] = cleanOptions(coloring);
        toSearch['Font'] = cleanOptions(font);
        toSearch['Location'] = cleanOptions(location);

        // SPECIAL - treated specially ;), need to go special attribute by special attribute
        var _special = [];
        const specialValues = cleanOptions(special);

        // Simple special ones
        const simpleItems = ["Cranberry juice", "Defaced", "Footprint", "Gold edges", "Washed", "Watermark"]
        for (var i = 0; i < simpleItems.length; i++) {
            if (specialValues.includes(simpleItems[i])) {
                _special.push({"trait_type":simpleItems[i],"value":true})
            }
        }

        // Shadow: Focused shadow, Menacing shadow, null
        if (specialValues.includes('Focused shadow')) {
            _special.push({"trait_type":"Shadow","value":"Focused shadow"})
        } 
        if (specialValues.includes('Menacing shadow')) {
            _special.push({"trait_type":"Shadow","value":"Menacing shadow"})
        }

        // Lettering: Gold lettering, Silver lettering, null
        if (specialValues.includes("Gold lettering")) {
            _special.push({"trait_type":"Special lettering","value":"Gold lettering"})
        } 
        if (specialValues.includes("Silver lettering")) {
            _special.push({"trait_type":"Special lettering","value":"Silver lettering"})
        }

        // Looking for NO special attributes
        if (specialValues.includes("*NONE")) {
            _special.push(
                {"trait_type":"Cranberry juice","value":null},
                {"trait_type":"Defaced","value":null},
                {"trait_type":"Footprint","value":null},
                {"trait_type":"Gold edges","value":null},
                {"trait_type":"Washed","value":null},
                {"trait_type":"Watermark","value":null},
                {"trait_type":"Shadow","value":null},
                {"trait_type":"Special lettering","value":null},
            )
        }
        
        toSearch['Special'] = _special;

        if (
            toSearch["Setting"].length === 0 &&
            toSearch["Paper"].length === 0 &&
            toSearch["Coloring"].length === 0 &&
            toSearch["Font"].length === 0 &&
            toSearch["Location"].length === 0 &&
            toSearch["Special"].length === 0
        ) {
            toSearch = null;
        }

        props.setToSearch(toSearch);
    
        // eslint-disable-next-line
    }, [setting, paper, coloring, font, location, special])

    return(
        <SearchItemsContainer>

            <Select
                styles={customStyles}
                options={listToOptions(settingList)}
                placeholder={'Setting'}
                isMulti={true}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                controlShouldRenderValue={false}
                autoBlur={false}
                value={setting}
                onChange={setSetting}
            />

            <Select
                styles={customStyles}
                options={listToOptions(paperList)}
                placeholder={'Paper'}
                isMulti={true}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                controlShouldRenderValue={false}
                autoBlur={false}
                value={paper}
                onChange={setPaper}
            />

            <Select
                styles={customStyles}
                options={listToOptions(coloringList)}
                placeholder={'Coloring'}
                isMulti={true}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                controlShouldRenderValue={false}
                autoBlur={false}
                value={coloring}
                onChange={setColoring}
            />

            <Select
                styles={customStyles}
                options={listToOptions(fontList)}
                placeholder={'Font'}
                isMulti={true}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                controlShouldRenderValue={false}
                autoBlur={false}
                value={font}
                onChange={setFont}
            />

            <Select
                styles={customStyles}
                options={listToOptions(locationList)}
                placeholder={'Location'}
                isMulti={true}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                controlShouldRenderValue={false}
                autoBlur={false}
                value={location}
                onChange={setLocation}
            />

            <Select
                styles={customStyles}
                options={listToOptions(specialList)}
                placeholder={'Special'}
                isMulti={true}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                controlShouldRenderValue={false}
                autoBlur={false}
                value={special}
                onChange={setSpecial}
            />

        </SearchItemsContainer>
    )
}

export default SearchItems;