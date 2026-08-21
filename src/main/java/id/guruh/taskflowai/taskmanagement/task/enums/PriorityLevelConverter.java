package id.guruh.taskflowai.taskmanagement.task.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class PriorityLevelConverter implements AttributeConverter<PriorityLevel, String> {

    @Override
    public String convertToDatabaseColumn(PriorityLevel attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name().toLowerCase();
    }

    @Override
    public PriorityLevel convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return PriorityLevel.valueOf(dbData.toUpperCase());
    }
}
