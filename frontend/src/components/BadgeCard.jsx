import { Award } from 'lucide-react';

const TYPE_CLASS = {
  ACADEMIC: 'tag-academic',
  SOCIAL:   'tag-social',
  ACTIVITY: 'tag-activity',
  SPECIAL:  'tag-special',
};

export default function BadgeCard({ badge, earnedAt }) {
  return (
    <div className="badge-card">
      <div className="badge-icon">
        <Award size={22} />
      </div>
      <h4>{badge.name}</h4>
      <p>{badge.description}</p>
      <span className={`tag ${TYPE_CLASS[badge.type] || 'tag-activity'}`}>
        {badge.type?.toLowerCase()}
      </span>
      {earnedAt && (
        <span className="badge-earned">
          Earned {new Date(earnedAt).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}
