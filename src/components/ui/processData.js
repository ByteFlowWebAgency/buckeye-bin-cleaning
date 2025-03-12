import initialInspectionIcon from '../../../public/assets/images/initial-inspection-icon.png';
import preTreatmentIcon from '../../../public/assets/images/pre-treatment-icon.png';
import highPressureIcon from '../../../public/assets/images/high-pressure-cleaning-icon.png';
import deodorizationIcon from '../../../public/assets/images/deordorization-icon.png';
import finalInspectionIcon from '../../../public/assets/images/final-inspection-icon.png';
import returnIcon from '../../../public/assets/images/return-bins-icon.png';
import billingIcon from '../../../public/assets/images/billing-icon.png';

export const processSteps = [
  {
    id: 1,
    icon: initialInspectionIcon,
    title: 'Initial Inspection',
    description: 'We start by inspecting your bins to determine the level of dirt, grime, and odor. Please ensure that all trash is removed from the bin prior to service appointment.'
  },
  {
    id: 2,
    icon: preTreatmentIcon,
    title: 'Pre-Treatment',
    description: 'Next, we apply an eco-friendly, biodegradable degreasing cleaning solution to break down tough grease and grime.'
  },
  {
    id: 3,
    icon: highPressureIcon,
    title: 'High-Pressure Cleaning',
    description: 'Using state-of-the-art equipment, we pressure wash the inside and outside of your bins with hot water, reaching temperatures up to 200°F. This ensures a deep clean, removing all debris, bacteria, and odors.'
  },
  {
    id: 4,
    icon: deodorizationIcon,
    title: 'Deodorization',
    description: 'Finally, we apply a deodorizing solution to leave your bins smelling fresh and pleasant.'
  },
  {
    id: 5,
    icon: finalInspectionIcon,
    title: 'Final Inspection',
    description: 'We conduct a final inspection to ensure your bins meet our high standard of cleanliness and sanitation.'
  },
  {
    id: 6,
    icon: returnIcon,
    title: 'Return of Bins',
    description: 'We will return bins to the side of the garage or in front of the gate if that is where they were retrieved from. If bins were left on the street for us to service, bins will be taken up to the garage or gate as well.'
  },
  {
    id: 7,
    icon: billingIcon,
    title: 'Billing',
    description: 'Billing will happen prior to service being done, please fill out your information on the website scheduling form, upon being filled out we will send an invoice to be paid via email.'
  }
];