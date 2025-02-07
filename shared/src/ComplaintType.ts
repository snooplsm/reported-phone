export enum ComplaintType {
    blocked_bike_lane = 'blocked bike lane',
    blocked_crosswalk = 'blocked crosswalk',
    missing_crosswalk = 'missing crosswalk'
}

export const complaintTypesJson = Object.values(ComplaintType).map(x=> {
    return {
        name: x
    }
});