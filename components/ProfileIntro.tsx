// Import React library.
import React, { useState } from 'react';
// Import the User type definition.
import { User } from '../types';

// Define the props interface for the ProfileIntro component.
interface ProfileIntroProps {
  user: User;
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
}

// Helper function to get a Font Awesome icon class based on a URL.
const getIconForUrl = (url: string): string => {
    if (url.includes('github.com')) return 'fa-brands fa-github';
    if (url.includes('dribbble.com')) return 'fa-brands fa-dribbble';
    if (url.includes('linkedin.com')) return 'fa-brands fa-linkedin';
    if (url.includes('behance.net')) return 'fa-brands fa-behance';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'fa-brands fa-twitter';
    return 'fa-solid fa-globe'; // Default globe icon for other links.
};

// Reusable input component for the details edit form.
const DetailInput: React.FC<{ icon: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ icon, name, value, onChange }) => (
    <div className="flex items-center space-x-3">
        <i className={`fa-solid ${icon} w-6 text-center text-neutral-500 dark:text-neutral-400`}></i>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={name.charAt(0).toUpperCase() + name.slice(1)}
            className="flex-grow bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none"
        />
    </div>
);


// The ProfileIntro functional component.
const ProfileIntro: React.FC<ProfileIntroProps> = ({ user, currentUser, onUpdateUser }) => {
  const isOwnProfile = user.id === currentUser.id;

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState(user.bio || '');

  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedDetails, setEditedDetails] = useState({
      location: user.location || '',
      education: user.education || '',
      relationshipStatus: user.relationshipStatus || '',
  });

  const handleSaveBio = () => {
      onUpdateUser({ ...user, bio: editedBio });
      setIsEditingBio(false);
  };

  const handleSaveDetails = () => {
      onUpdateUser({ ...user, ...editedDetails });
      setIsEditingDetails(false);
  };
  
  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditedDetails({ ...editedDetails, [e.target.name]: e.target.value });
  };
  

  return (
    <div className="sticky top-16 space-y-4">
      <div className="bg-white dark:bg-black rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Intro</h2>
        
        {isEditingBio ? (
            <div className="space-y-2 mb-4">
                <textarea 
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    rows={4}
                    className="w-full bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none"
                />
                <div className="flex justify-end space-x-2">
                    <button onClick={() => setIsEditingBio(false)} className="bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-600 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold py-1 px-3 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleSaveBio} className="bg-accent hover:bg-accent-hover text-accent-text-over font-bold py-1 px-3 rounded-lg transition-colors">Save</button>
                </div>
            </div>
        ) : (
            <>
                {user.bio && <p className="text-center text-neutral-700 dark:text-neutral-300 mb-4">{user.bio}</p>}
                {isOwnProfile && (
                    <button onClick={() => { setIsEditingBio(true); setEditedBio(user.bio || ''); }} className="w-full bg-neutral-100 dark:bg-[#3A3B3C] hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 font-semibold py-2 rounded-lg transition-colors mb-4">Edit bio</button>
                )}
            </>
        )}

        {isEditingDetails ? (
            <div className="space-y-3">
                <DetailInput icon="fa-map-marker-alt" name="location" value={editedDetails.location} onChange={handleDetailsChange} />
                <DetailInput icon="fa-graduation-cap" name="education" value={editedDetails.education} onChange={handleDetailsChange} />
                <DetailInput icon="fa-heart" name="relationshipStatus" value={editedDetails.relationshipStatus} onChange={handleDetailsChange} />
                 <div className="flex justify-end space-x-2 pt-2">
                    <button onClick={() => setIsEditingDetails(false)} className="bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-600 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold py-1 px-3 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleSaveDetails} className="bg-accent hover:bg-accent-hover text-accent-text-over font-bold py-1 px-3 rounded-lg transition-colors">Save</button>
                </div>
            </div>
        ) : (
            <>
                <ul className="space-y-3 text-neutral-700 dark:text-neutral-300">
                    {user.location && <li className="flex items-center"><i className="fa-solid fa-map-marker-alt w-6 mr-2 text-neutral-500 dark:text-neutral-400"></i> {user.location}</li>}
                    {user.education && <li className="flex items-center"><i className="fa-solid fa-graduation-cap w-6 mr-2 text-neutral-500 dark:text-neutral-400"></i> {user.education}</li>}
                    {user.relationshipStatus && <li className="flex items-center"><i className="fa-solid fa-heart w-6 mr-2 text-neutral-500 dark:text-neutral-400"></i> {user.relationshipStatus}</li>}
                </ul>
                {isOwnProfile && (
                    <button onClick={() => { setIsEditingDetails(true); setEditedDetails({ location: user.location || '', education: user.education || '', relationshipStatus: user.relationshipStatus || '' }); }} className="w-full bg-neutral-100 dark:bg-[#3A3B3C] hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 font-semibold py-2 rounded-lg transition-colors mt-4">Edit details</button>
                )}
            </>
        )}
        
        {user.skills && user.skills.length > 0 && (
          <>
            <hr className="my-4 border-neutral-200 dark:border-neutral-800"/>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map(skill => (
                <span key={skill} className="bg-violet-100 text-accent dark:bg-violet-900/50 dark:text-violet-300 text-sm font-semibold px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </>
        )}

        {user.portfolio && user.portfolio.length > 0 && (
          <>
            <hr className="my-4 border-neutral-200 dark:border-neutral-800"/>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-3">Portfolio</h3>
            <ul className="space-y-1">
              {user.portfolio.map((item, index) => (
                <li key={index}>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center space-x-3 p-2 -ml-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#3A3B3C] transition-colors"
                  >
                    <i className={`${getIconForUrl(item.url)} w-6 text-center text-xl text-neutral-500 dark:text-neutral-400`}></i>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 hover:underline">{item.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileIntro;